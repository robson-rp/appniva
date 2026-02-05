<?php

namespace App\Services;

use App\Models\User;
use App\Models\FinancialScore;
use Carbon\Carbon;

class FinancialScoreService
{
    private BudgetService $budgetService;
    private DebtService $debtService;
    private InvestmentService $investmentService;

    public function __construct(
        BudgetService $budgetService,
        DebtService $debtService,
        InvestmentService $investmentService
    ) {
        $this->budgetService = $budgetService;
        $this->debtService = $debtService;
        $this->investmentService = $investmentService;
    }

    /**
     * Calcula o score financeiro completo do usuário
     */
    public function calculateScore(User $user): int
    {
        $scores = [
            'savings_rate' => $this->calculateSavingsScore($user),
            'debt_ratio' => $this->calculateDebtScore($user),
            'investment' => $this->calculateInvestmentScore($user),
            'goal_progress' => $this->calculateGoalScore($user),
        ];

        // Score final é a média ponderada
        $weights = [
            'savings_rate' => 0.35,
            'debt_ratio' => 0.25,
            'investment' => 0.25,
            'goal_progress' => 0.15,
        ];

        $totalScore = 0;
        foreach ($scores as $key => $score) {
            $totalScore += $score * $weights[$key];
        }

        return (int) round($totalScore);
    }

    /**
     * Calcula score baseado em taxa de poupança
     */
    private function calculateSavingsScore(User $user): float
    {
        $profile = $user->profile;
        if (!$profile || $profile->monthly_income == 0) return 0;

        // Últimos 3 meses
        $startDate = now()->subMonths(3)->startOfMonth();
        $endDate = now()->endOfMonth();

        $income = $profile->monthly_income * 3;
        $expenses = $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');

        $savings = $income - $expenses;
        $savingsRate = ($savings / $income) * 100;

        // Mapping: 0% = 0 pontos, 20% = 100 pontos
        return min(100, max(0, $savingsRate * 5));
    }

    /**
     * Calcula score baseado em relação dívida/renda
     */
    private function calculateDebtScore(User $user): float
    {
        $profile = $user->profile;
        if (!$profile || $profile->monthly_income == 0) return 100;

        $totalDebt = $user->debts()
            ->where('is_active', true)
            ->get()
            ->sum(fn($d) => $this->debtService->calculateRemainingBalance($d));

        $debtRatio = $totalDebt / ($profile->monthly_income * 12);

        // Mapping: 0% = 100, 100% = 0
        return max(0, 100 - ($debtRatio * 100));
    }

    /**
     * Calcula score baseado em investimentos
     */
    private function calculateInvestmentScore(User $user): float
    {
        $portfolio = $this->investmentService->analyzePortfolio($user);
        
        if ($portfolio['total_invested'] == 0) return 0;

        $investmentAmount = $portfolio['total_invested'];
        $profile = $user->profile;

        if (!$profile || $profile->monthly_income == 0) return 0;

        // Ideal: investir 20% da renda anual
        $targetInvestment = $profile->monthly_income * 12 * 0.2;
        $investmentRatio = min(1, $investmentAmount / $targetInvestment);

        return $investmentRatio * 100;
    }

    /**
     * Calcula score baseado em progresso de metas
     */
    private function calculateGoalScore(User $user): float
    {
        $goals = $user->goals()->get();
        
        if ($goals->isEmpty()) return 50; // Penalidade por não ter metas

        $totalContributed = 0;
        $totalTarget = 0;

        foreach ($goals as $goal) {
            $contributed = $goal->contributions()->sum('amount');
            $totalContributed += $contributed;
            $totalTarget += $goal->target_amount;
        }

        if ($totalTarget == 0) return 50;

        $progressRatio = $totalContributed / $totalTarget;
        return min(100, $progressRatio * 100);
    }

    /**
     * Armazena o score calculado
     */
    public function recordScore(User $user): FinancialScore
    {
        $score = $this->calculateScore($user);

        return FinancialScore::create([
            'user_id' => $user->id,
            'score' => $score,
            'date' => now(),
            'savings_rate_score' => $this->calculateSavingsScore($user),
            'debt_ratio_score' => $this->calculateDebtScore($user),
            'investment_score' => $this->calculateInvestmentScore($user),
            'goal_progress_score' => $this->calculateGoalScore($user),
        ]);
    }
}
