<?php

namespace App\Services;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;

class AssistantService
{
    public function __construct(
        protected FinancialScoreService $scoreService,
        protected InsightService $insightService,
        protected BudgetService $budgetService
    ) {}
    
    /**
     * Generate financial summary for user
     */
    public function generateFinancialSummary(User $user, array $options = []): array
    {
        $period = $options['period'] ?? 'month';
        $startDate = $this->getStartDate($period);
        
        $income = Transaction::where('user_id', $user->id)
            ->where('type', 'income')
            ->where('date', '>=', $startDate)
            ->sum('amount');
            
        $expenses = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->where('date', '>=', $startDate)
            ->sum('amount');
            
        $balance = $income - $expenses;
        $savingsRate = $income > 0 ? ($balance / $income) * 100 : 0;
        
        return [
            'period' => $period,
            'start_date' => $startDate,
            'income' => $income,
            'expenses' => $expenses,
            'balance' => $balance,
            'savings_rate' => round($savingsRate, 2),
            'insights' => $this->insightService->generateInsights($user->id),
        ];
    }
    
    /**
     * Answer user financial question using context
     */
    public function answerQuestion(User $user, string $question): array
    {
        // TODO: Integrate with LLM service
        
        // Gather context
        $context = $this->gatherContext($user);
        
        // Detect question type
        $questionType = $this->detectQuestionType($question);
        
        // Generate response based on type
        $response = match($questionType) {
            'spending' => $this->answerSpendingQuestion($user, $question, $context),
            'budget' => $this->answerBudgetQuestion($user, $question, $context),
            'savings' => $this->answerSavingsQuestion($user, $question, $context),
            'investment' => $this->answerInvestmentQuestion($user, $question, $context),
            default => $this->generateGenericAnswer($user, $question, $context),
        };
        
        return [
            'question' => $question,
            'answer' => $response,
            'type' => $questionType,
            'context_used' => array_keys($context),
        ];
    }
    
    /**
     * Generate personalized recommendations
     */
    public function generateRecommendations(User $user): array
    {
        $recommendations = [];
        
        // Get financial score
        $score = $this->scoreService->calculateScore($user->id);
        
        // Budget recommendations
        if ($score['budget_health'] < 70) {
            $recommendations[] = [
                'type' => 'budget',
                'priority' => 'high',
                'title' => 'Otimize seus orçamentos',
                'description' => 'Você está gastando acima do orçamento em algumas categorias.',
                'action' => 'review_budgets',
            ];
        }
        
        // Savings recommendations
        if ($score['savings_rate'] < 20) {
            $recommendations[] = [
                'type' => 'savings',
                'priority' => 'high',
                'title' => 'Aumente sua taxa de poupança',
                'description' => 'Sua taxa de poupança está abaixo do recomendado (20%).',
                'action' => 'create_savings_goal',
            ];
        }
        
        // Debt recommendations
        if ($score['debt_ratio'] > 30) {
            $recommendations[] = [
                'type' => 'debt',
                'priority' => 'high',
                'title' => 'Reduza suas dívidas',
                'description' => 'Seu índice de endividamento está acima do recomendado.',
                'action' => 'create_debt_payoff_plan',
            ];
        }
        
        // Investment recommendations
        if ($score['investment_score'] < 50) {
            $recommendations[] = [
                'type' => 'investment',
                'priority' => 'medium',
                'title' => 'Considere diversificar investimentos',
                'description' => 'Você pode melhorar seus retornos diversificando.',
                'action' => 'explore_investments',
            ];
        }
        
        return $recommendations;
    }
    
    /**
     * Gather financial context for user
     */
    private function gatherContext(User $user): array
    {
        return [
            'recent_transactions' => Transaction::where('user_id', $user->id)
                ->orderBy('date', 'desc')
                ->limit(10)
                ->get(),
            'financial_score' => $this->scoreService->calculateScore($user->id),
            'budget_status' => $this->budgetService->getBudgetSummary($user->id),
            'insights' => $this->insightService->generateInsights($user->id),
        ];
    }
    
    /**
     * Detect question type from text
     */
    private function detectQuestionType(string $question): string
    {
        $question = strtolower($question);
        
        if (str_contains($question, 'gast') || str_contains($question, 'despesa')) {
            return 'spending';
        }
        
        if (str_contains($question, 'orcamento') || str_contains($question, 'budget')) {
            return 'budget';
        }
        
        if (str_contains($question, 'poupar') || str_contains($question, 'poupanca')) {
            return 'savings';
        }
        
        if (str_contains($question, 'investir') || str_contains($question, 'investimento')) {
            return 'investment';
        }
        
        return 'general';
    }
    
    /**
     * Generate answer for spending questions
     */
    private function answerSpendingQuestion(User $user, string $question, array $context): string
    {
        $totalSpent = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->where('date', '>=', now()->startOfMonth())
            ->sum('amount');
            
        return "Você gastou {$totalSpent} AOA este mês. " . 
               $this->generateSpendingAdvice($totalSpent, $context);
    }
    
    /**
     * Generate advice based on spending
     */
    private function generateSpendingAdvice(float $amount, array $context): string
    {
        $budgetStatus = $context['budget_status'] ?? [];
        $totalBudget = $budgetStatus['total_budget'] ?? 0;
        
        if ($totalBudget > 0 && $amount > $totalBudget * 0.9) {
            return "Atenção: você já gastou mais de 90% do seu orçamento mensal.";
        }
        
        return "Seus gastos estão dentro do esperado.";
    }
    
    /**
     * Get start date based on period
     */
    private function getStartDate(string $period): string
    {
        return match($period) {
            'week' => now()->startOfWeek()->toDateString(),
            'month' => now()->startOfMonth()->toDateString(),
            'quarter' => now()->startOfQuarter()->toDateString(),
            'year' => now()->startOfYear()->toDateString(),
            default => now()->startOfMonth()->toDateString(),
        };
    }
    
    /**
     * Answer budget-related questions
     */
    private function answerBudgetQuestion(User $user, string $question, array $context): string
    {
        return "Análise de orçamento em desenvolvimento.";
    }
    
    /**
     * Answer savings-related questions
     */
    private function answerSavingsQuestion(User $user, string $question, array $context): string
    {
        return "Análise de poupança em desenvolvimento.";
    }
    
    /**
     * Answer investment-related questions
     */
    private function answerInvestmentQuestion(User $user, string $question, array $context): string
    {
        return "Análise de investimentos em desenvolvimento.";
    }
    
    /**
     * Generate generic answer
     */
    private function generateGenericAnswer(User $user, string $question, array $context): string
    {
        return "Estou aqui para ajudar com suas finanças. " .
               "Posso responder perguntas sobre gastos, orçamentos, poupanças e investimentos.";
    }
}
