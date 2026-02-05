<?php

namespace App\Services;

use App\Models\User;
use App\Models\Insight;
use App\Models\Transaction;
use Carbon\Carbon;

/**
 * Service para geração de insights financeiros
 * Analisa padrões e fornece recomendações
 */
class InsightService
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
     * Gera todos os insights para um usuário
     */
    public function generateInsights(User $user): array
    {
        $insights = [];

        $insights = array_merge($insights, $this->analyzeBudgetInsights($user));
        $insights = array_merge($insights, $this->analyzeSpendingPatterns($user));
        $insights = array_merge($insights, $this->analyzeDebtInsights($user));
        $insights = array_merge($insights, $this->analyzeInvestmentInsights($user));
        $insights = array_merge($insights, $this->analyzeGoalInsights($user));

        return array_slice($insights, 0, 10); // Top 10 insights
    }

    /**
     * Analisa orçamentos e gera insights
     */
    private function analyzeBudgetInsights(User $user): array
    {
        $insights = [];
        $alerts = $this->budgetService->generateAlerts($user);

        foreach ($alerts as $alert) {
            $insight = [
                'type' => 'budget',
                'title' => "Orçamento de {$alert['category']} em risco",
                'description' => "Você já utilizou {$alert['percentage']}% do seu orçamento de {$alert['category']}. " .
                    "Restam apenas R$ " . number_format($alert['remaining'], 2, ',', '.'),
                'priority' => $alert['severity'] === 'critical' ? 'high' : 'medium',
                'related_entity_type' => 'Budget',
                'related_entity_id' => $alert['budget_id'],
            ];

            $insights[] = $insight;
        }

        return $insights;
    }

    /**
     * Analisa padrões de gastos
     */
    private function analyzeSpendingPatterns(User $user): array
    {
        $insights = [];
        $month = now()->startOfMonth();
        $expenses = $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('date', [$month, $month->endOfMonth()])
            ->get();

        if ($expenses->isEmpty()) {
            return $insights;
        }

        // Categoria com maior gasto
        $topCategory = $expenses->groupBy('category_id')
            ->map(fn($g) => $g->sum('amount'))
            ->sort()
            ->last();

        if ($topCategory) {
            $insights[] = [
                'type' => 'spending',
                'title' => 'Categoria com maior gasto',
                'description' => "Sua categoria com maior gasto este mês foi {$topCategory} (R$ " .
                    number_format($topCategory, 2, ',', '.') . ").",
                'priority' => 'low',
            ];
        }

        // Alertar se gasto está acima da média
        $avgMonthlyExpense = $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('date', [now()->subMonths(3), now()])
            ->avg('amount') * 30; // Aproximação

        $currentTotal = $expenses->sum('amount');
        if ($currentTotal > $avgMonthlyExpense * 1.2) {
            $insights[] = [
                'type' => 'spending',
                'title' => 'Gastos acima da média',
                'description' => "Seus gastos estão 20% acima da média dos últimos 3 meses.",
                'priority' => 'medium',
            ];
        }

        return $insights;
    }

    /**
     * Gera insights sobre dívidas
     */
    private function analyzeDebtInsights(User $user): array
    {
        $insights = [];
        $debts = $user->debts()->where('is_active', true)->get();

        if ($debts->isEmpty()) {
            return $insights;
        }

        foreach ($debts as $debt) {
            $suggestion = $this->debtService->getSuggestion($user);
            if ($suggestion) {
                $insights[] = [
                    'type' => 'debt',
                    'title' => 'Recomendação de pagamento de dívida',
                    'description' => $suggestion,
                    'priority' => 'high',
                    'related_entity_type' => 'Debt',
                    'related_entity_id' => $debt->id,
                ];
            }
        }

        return $insights;
    }

    /**
     * Gera insights sobre investimentos
     */
    private function analyzeInvestmentInsights(User $user): array
    {
        $insights = [];
        $portfolio = $this->investmentService->analyzePortfolio($user);

        if ($portfolio['total_invested'] == 0) {
            $insights[] = [
                'type' => 'investment',
                'title' => 'Comece a investir',
                'description' => 'Você ainda não tem investimentos. Considere alocar parte da sua renda em investimentos.',
                'priority' => 'low',
            ];
            return $insights;
        }

        // Alerta de risco
        if ($portfolio['risk_assessment'] === 'high') {
            $insights[] = [
                'type' => 'investment',
                'title' => 'Carteira com risco elevado',
                'description' => 'Sua carteira tem mais de 60% em ativos de alto risco (ações, cripto). Considere diversificar.',
                'priority' => 'medium',
            ];
        }

        // Retorno positivo
        if ($portfolio['total_return_percentage'] > 10) {
            $insights[] = [
                'type' => 'investment',
                'title' => 'Ótimo retorno!',
                'description' => "Seus investimentos tiveram retorno de {$portfolio['total_return_percentage']}%. Parabéns!",
                'priority' => 'low',
            ];
        }

        return $insights;
    }

    /**
     * Gera insights sobre metas
     */
    private function analyzeGoalInsights(User $user): array
    {
        $insights = [];
        $goals = $user->goals()->get();

        foreach ($goals as $goal) {
            $contributed = $goal->contributions()->sum('amount');
            $percentage = ($contributed / $goal->target_amount) * 100;

            if ($percentage >= 75) {
                $insights[] = [
                    'type' => 'goal',
                    'title' => "Meta '{$goal->name}' quase atingida!",
                    'description' => "Você atingiu {$percentage}% da sua meta. Pouco falta!",
                    'priority' => 'low',
                    'related_entity_type' => 'Goal',
                    'related_entity_id' => $goal->id,
                ];
            }
        }

        return $insights;
    }

    /**
     * Armazena insight no banco de dados
     */
    public function storeInsight(User $user, array $insightData): Insight
    {
        return Insight::create([
            'user_id' => $user->id,
            'type' => $insightData['type'],
            'title' => $insightData['title'],
            'description' => $insightData['description'],
            'priority' => $insightData['priority'] ?? 'medium',
            'related_entity_type' => $insightData['related_entity_type'] ?? null,
            'related_entity_id' => $insightData['related_entity_id'] ?? null,
            'is_read' => false,
        ]);
    }
}
