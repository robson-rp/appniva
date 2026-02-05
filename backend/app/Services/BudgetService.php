<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;

class BudgetService
{
    /**
     * Calcula o gasto total do usuário em um período
     */
    public function calculateSpending(User $user, Carbon $startDate, Carbon $endDate, ?int $categoryId = null): float
    {
        $query = Transaction::whereBelongsTo($user)
            ->where('type', 'expense')
            ->whereBetween('date', [$startDate, $endDate]);
        
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }
        
        return (float) $query->sum('amount');
    }

    /**
     * Verifica se o usuário ultrapassou o orçamento
     */
    public function isOverBudget(Budget $budget): bool
    {
        $spending = $this->calculateSpending(
            $budget->user,
            $budget->start_date,
            $budget->end_date,
            $budget->category_id
        );
        
        return $spending > $budget->limit_amount;
    }

    /**
     * Calcula a porcentagem utilizada do orçamento
     */
    public function getUsagePercentage(Budget $budget): float
    {
        $spending = $this->calculateSpending(
            $budget->user,
            $budget->start_date,
            $budget->end_date,
            $budget->category_id
        );
        
        $percentage = ($spending / $budget->limit_amount) * 100;
        
        return min(100, round($percentage, 2));
    }

    /**
     * Retorna o valor restante no orçamento
     */
    public function getRemainingAmount(Budget $budget): float
    {
        $spending = $this->calculateSpending(
            $budget->user,
            $budget->start_date,
            $budget->end_date,
            $budget->category_id
        );
        
        return max(0, $budget->limit_amount - $spending);
    }

    /**
     * Gera alertas para orçamentos próximos ao limite
     */
    public function generateAlerts(User $user): array
    {
        $alerts = [];
        $budgets = Budget::whereBelongsTo($user)
            ->where('is_active', true)
            ->get();
        
        foreach ($budgets as $budget) {
            $percentage = $this->getUsagePercentage($budget);
            
            if ($percentage >= 90) {
                $alerts[] = [
                    'budget_id' => $budget->id,
                    'category' => $budget->category?->name,
                    'percentage' => $percentage,
                    'remaining' => $this->getRemainingAmount($budget),
                    'severity' => $percentage >= 100 ? 'critical' : 'warning',
                ];
            }
        }
        
        return $alerts;
    }
}
