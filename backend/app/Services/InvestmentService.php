<?php

namespace App\Services;

use App\Models\Investment;
use App\Models\User;
use Carbon\Carbon;

class InvestmentService
{
    /**
     * Calcula o retorno de um investimento
     */
    public function calculateReturn(Investment $investment): float
    {
        if (!$investment->current_value || !$investment->amount_invested) {
            return 0;
        }
        
        return round($investment->current_value - $investment->amount_invested, 2);
    }

    /**
     * Calcula a porcentagem de retorno
     */
    public function calculateReturnPercentage(Investment $investment): float
    {
        if (!$investment->amount_invested || $investment->amount_invested == 0) {
            return 0;
        }
        
        $return = $this->calculateReturn($investment);
        return round(($return / $investment->amount_invested) * 100, 2);
    }

    /**
     * Calcula o retorno anualizado
     */
    public function calculateAnnualizedReturn(Investment $investment): float
    {
        if (!$investment->purchase_date || !$investment->current_value) {
            return 0;
        }
        
        $months = $investment->purchase_date->diffInMonths($investment->maturity_date ?? now());
        if ($months == 0) return 0;
        
        $monthlyReturn = $this->calculateReturn($investment) / $months;
        return round($monthlyReturn * 12, 2);
    }

    /**
     * Analisa carteira de investimentos do usuário
     */
    public function analyzePortfolio(User $user): array
    {
        $investments = $user->investments()->get();
        
        $totalInvested = $investments->sum('amount_invested');
        $totalCurrent = $investments->sum('current_value') ?? $totalInvested;
        $totalReturn = $totalCurrent - $totalInvested;
        
        $byType = $investments->groupBy('type')->map(function($group) use ($totalInvested) {
            $amount = $group->sum('amount_invested');
            return [
                'amount' => round($amount, 2),
                'percentage' => round(($amount / $totalInvested) * 100, 2),
                'count' => $group->count(),
            ];
        });
        
        return [
            'total_invested' => round($totalInvested, 2),
            'total_current_value' => round($totalCurrent, 2),
            'total_return' => round($totalReturn, 2),
            'total_return_percentage' => round(($totalReturn / $totalInvested) * 100, 2),
            'by_type' => $byType,
            'diversification_score' => $this->calculateDiversificationScore($investments),
            'risk_assessment' => $this->assessRisk($investments),
        ];
    }

    /**
     * Calcula score de diversificação
     */
    private function calculateDiversificationScore($investments): float
    {
        $types = $investments->pluck('type')->unique()->count();
        return min(100, ($types / 6) * 100); // 6 tipos diferentes máximo
    }

    /**
     * Avalia risco da carteira
     */
    private function assessRisk($investments): string
    {
        $highRisk = $investments->whereIn('type', ['crypto', 'stock'])->count();
        $lowRisk = $investments->whereIn('type', ['bond', 'term_deposit'])->count();
        
        $total = $investments->count();
        if ($total == 0) return 'neutral';
        
        $highRiskRatio = $highRisk / $total;
        
        if ($highRiskRatio > 0.6) return 'high';
        if ($highRiskRatio > 0.3) return 'moderate';
        return 'low';
    }
}
