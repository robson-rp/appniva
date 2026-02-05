<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;

/**
 * Service para gerenciar operações de transações
 * Inclui validações, filtros avançados e operações em lote
 */
class TransactionService
{
    private CategorizationService $categorizationService;

    public function __construct(CategorizationService $categorizationService)
    {
        $this->categorizationService = $categorizationService;
    }

    /**
     * Cria transação com categorização automática se necessário
     */
    public function createWithAutoCategory(User $user, array $data): Transaction
    {
        $transaction = new Transaction($data);
        $transaction->user_id = $user->id;

        // Se não tiver categoria, sugerir automaticamente
        if (!$transaction->category_id) {
            $suggestedCategory = $this->categorizationService->suggestCategory($transaction);
            if ($suggestedCategory) {
                $transaction->category_id = $suggestedCategory->id;
            }
        }

        $transaction->save();
        return $transaction;
    }

    /**
     * Valida dupliância de transação
     */
    public function isDuplicate(User $user, array $data): bool
    {
        // Transações duplicadas têm mesmo valor, tipo, data e descrição similares
        $recent = $user->transactions()
            ->where('amount', $data['amount'])
            ->where('type', $data['type'])
            ->where('date', $data['date'])
            ->where('account_id', $data['account_id'] ?? null)
            ->whereBetween('created_at', [now()->subHours(1), now()])
            ->exists();

        return $recent;
    }

    /**
     * Retorna transações filtradas e paginadas
     */
    public function getFiltered(User $user, array $filters = [], int $perPage = 15)
    {
        $query = $user->transactions();

        // Filtro por tipo
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        // Filtro por categoria
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Filtro por conta
        if (!empty($filters['account_id'])) {
            $query->where('account_id', $filters['account_id']);
        }

        // Filtro por período
        if (!empty($filters['start_date'])) {
            $query->where('date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->where('date', '<=', $filters['end_date']);
        }

        // Filtro por amplitude de valor
        if (!empty($filters['min_amount'])) {
            $query->where('amount', '>=', $filters['min_amount']);
        }

        if (!empty($filters['max_amount'])) {
            $query->where('amount', '<=', $filters['max_amount']);
        }

        // Busca por descrição
        if (!empty($filters['search'])) {
            $query->where('description', 'like', '%' . $filters['search'] . '%');
        }

        // Ordenação
        $sortBy = $filters['sort_by'] ?? 'date';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($perPage);
    }

    /**
     * Calcula estatísticas de transações
     */
    public function getStatistics(User $user, Carbon $startDate, Carbon $endDate): array
    {
        $transactions = $user->transactions()
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        $income = $transactions->where('type', 'income')->sum('amount');
        $expenses = $transactions->where('type', 'expense')->sum('amount');
        $net = $income - $expenses;

        // Por categoria
        $byCategory = $transactions
            ->where('type', 'expense')
            ->groupBy('category_id')
            ->map(fn($group) => [
                'category' => $group->first()->category?->name,
                'amount' => $group->sum('amount'),
                'count' => $group->count(),
            ])
            ->sortByDesc('amount');

        // Por dia
        $byDay = $transactions
            ->groupBy(fn($t) => $t->date->format('Y-m-d'))
            ->map(fn($group) => [
                'date' => $group->first()->date->format('Y-m-d'),
                'income' => $group->where('type', 'income')->sum('amount'),
                'expense' => $group->where('type', 'expense')->sum('amount'),
            ])
            ->sortBy('date');

        return [
            'period' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
            'summary' => [
                'total_income' => round($income, 2),
                'total_expenses' => round($expenses, 2),
                'net' => round($net, 2),
                'transaction_count' => $transactions->count(),
            ],
            'by_category' => $byCategory->values(),
            'by_day' => $byDay->values(),
            'average_daily_expense' => round($expenses / $endDate->diffInDays($startDate), 2),
        ];
    }

    /**
     * Detecta anomalias em transações
     */
    public function detectAnomalies(User $user): array
    {
        $anomalies = [];
        $recentTransactions = $user->transactions()
            ->where('date', '>=', now()->subMonths(3))
            ->get();

        if ($recentTransactions->isEmpty()) {
            return $anomalies;
        }

        // Valor médio e desvio padrão
        $amounts = $recentTransactions->pluck('amount')->toArray();
        $avg = array_sum($amounts) / count($amounts);
        $variance = array_sum(array_map(fn($x) => pow($x - $avg, 2), $amounts)) / count($amounts);
        $stdDev = sqrt($variance);

        // Detectar outliers (> 2 desvios padrão)
        foreach ($recentTransactions as $transaction) {
            if (abs($transaction->amount - $avg) > 2 * $stdDev) {
                $anomalies[] = [
                    'transaction_id' => $transaction->id,
                    'amount' => $transaction->amount,
                    'expected_range' => [$avg - $stdDev, $avg + $stdDev],
                    'severity' => abs($transaction->amount - $avg) > 3 * $stdDev ? 'high' : 'medium',
                ];
            }
        }

        return $anomalies;
    }

    /**
     * Transfira/duplica transações entre contas
     */
    public function duplicateTransaction(Transaction $transaction, int $newAccountId): Transaction
    {
        return Transaction::create([
            'user_id' => $transaction->user_id,
            'account_id' => $newAccountId,
            'amount' => $transaction->amount,
            'type' => $transaction->type,
            'date' => $transaction->date,
            'description' => $transaction->description . ' (Duplicada)',
            'category_id' => $transaction->category_id,
            'cost_center_id' => $transaction->cost_center_id,
        ]);
    }
}
