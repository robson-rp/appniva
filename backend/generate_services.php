<?php

/**
 * Script para gerar Business Logic Services para Phase 6
 * 
 * Services a serem criadas:
 * - BudgetService: Cálculos de orçamento
 * - DebtService: Gerenciamento de dívidas
 * - InvestmentService: Análise de investimentos
 * - FinancialScoreService: Cálculo de score financeiro
 * - CategorizationService: Categorização automática
 * - InsightService: Geração de insights
 * - TransactionService: Operações em transações
 */

$services = [
    // ============================
    // BUDGET SERVICE
    // ============================
    'BudgetService' => <<<'PHP'
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

PHP,

    // ============================
    // DEBT SERVICE
    // ============================
    'DebtService' => <<<'PHP'
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

PHP,

    // ============================
    // INVESTMENT SERVICE
    // ============================
    'InvestmentService' => <<<'PHP'
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

PHP,

    // ============================
    // FINANCIAL SCORE SERVICE
    // ============================
    'FinancialScoreService' => <<<'PHP'
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

PHP,
];

$servicesDir = __DIR__ . '/app/Services';

// Criar diretório se não existir
if (!is_dir($servicesDir)) {
    mkdir($servicesDir, 0755, true);
}

echo "🚀 Gerando Business Logic Services...\n\n";

foreach ($services as $name => $content) {
    $filePath = "{$servicesDir}/{$name}.php";
    file_put_contents($filePath, $content);
    echo "✓ Criado: {$name}.php\n";
}

echo "\n✅ Services criados com sucesso!\n";
echo "   Total: " . count($services) . " Services\n";
echo "   Localização: {$servicesDir}\n";
