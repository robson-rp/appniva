<?php

namespace App\Services;

use App\Models\Debt;
use App\Models\DebtPayment;
use App\Models\User;
use Carbon\Carbon;

class DebtService
{
    /**
     * Calcula o saldo restante da dívida
     */
    public function calculateRemainingBalance(Debt $debt): float
    {
        $totalPaid = $debt->payments()
            ->sum('amount');
        
        return max(0, $debt->total_amount - $totalPaid);
    }

    /**
     * Calcula o juro acumulado até uma data
     */
    public function calculateAccruedInterest(Debt $debt, ?Carbon $until = null): float
    {
        $until = $until ?? now();
        $balance = $this->calculateRemainingBalance($debt);
        
        if ($balance <= 0 || !$debt->interest_rate) {
            return 0;
        }
        
        $monthsElapsed = $debt->start_date->diffInMonths($until);
        $monthlyRate = $debt->interest_rate / 12 / 100;
        
        return round($balance * $monthlyRate * $monthsElapsed, 2);
    }

    /**
     * Retorna o plano de pagamento para quitação da dívida
     */
    public function getPayoffSchedule(Debt $debt, int $monthlyPayment): array
    {
        $schedule = [];
        $balance = $this->calculateRemainingBalance($debt);
        $currentDate = now();
        $month = 0;
        
        while ($balance > 0 && $month < 360) { // Máximo 30 anos
            $interest = $this->calculateAccruedInterest($debt, $currentDate);
            $principal = min($monthlyPayment - $interest, $balance);
            
            if ($principal <= 0) break;
            
            $balance -= $principal;
            $month++;
            $currentDate->addMonth();
            
            $schedule[] = [
                'month' => $month,
                'date' => $currentDate->toDateString(),
                'payment' => round($principal + $interest, 2),
                'principal' => round($principal, 2),
                'interest' => round($interest, 2),
                'remaining_balance' => max(0, round($balance, 2)),
            ];
        }
        
        return $schedule;
    }

    /**
     * Sugere melhor estratégia de quitação
     */
    public function getSuggestion(User $user): ?string
    {
        $debts = Debt::whereBelongsTo($user)
            ->where('is_active', true)
            ->orderBy('interest_rate', 'desc')
            ->get();
        
        if ($debts->isEmpty()) {
            return null;
        }
        
        $highestRate = $debts->first();
        $totalDebt = $debts->sum(fn($d) => $this->calculateRemainingBalance($d));
        
        if ($totalDebt > $user->getTotalIncome() * 0.5) {
            return "Você tem dívidas acima de 50% da sua renda. Considere negociar com credores.";
        }
        
        return "Priorize pagar a dívida com taxa de {$highestRate->interest_rate}% a.m. primeiro (juros maiores).";
    }
}
