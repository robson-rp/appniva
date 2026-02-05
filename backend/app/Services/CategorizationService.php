<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Category;
use App\Models\User;

/**
 * Service para categorização automática de transações
 * Usa padrões de descrição e histórico para sugerir categorias
 */
class CategorizationService
{
    /**
     * Padrões de categorização baseados em palavras-chave
     */
    private array $patterns = [
        'Alimentação' => ['super', 'mercearia', 'padaria', 'açougue', 'restaurante', 'comida', 'almoço', 'pizza', 'burguer'],
        'Transporte' => ['uber', 'taxi', 'gasolina', 'combustivel', 'estacionamento', 'bus', 'onibus', 'passagem'],
        'Saúde' => ['farmacia', 'medico', 'hospital', 'dentista', 'clinica', 'farmaceutica'],
        'Educação' => ['escola', 'universidade', 'cursinho', 'aula', 'apostila', 'livro'],
        'Utilidades' => ['agua', 'luz', 'gas', 'telefone', 'internet', 'energia'],
        'Lazer' => ['cinema', 'teatro', 'show', 'musica', 'spotify', 'netflix', 'game'],
        'Vestuário' => ['roupas', 'sapato', 'loja', 'moda', 'calçado', 'bolsa'],
        'Moradia' => ['aluguel', 'condominio', 'imovel', 'casa', 'apartamento'],
    ];

    /**
     * Sugere categoria para uma transação
     */
    public function suggestCategory(Transaction $transaction): ?Category
    {
        // Tentar por padrão de descrição
        if ($transaction->description) {
            $categoryName = $this->matchPattern($transaction->description);
            if ($categoryName) {
                return Category::where('name', $categoryName)
                    ->where('user_id', $transaction->user_id)
                    ->first();
            }
        }

        // Tentar por histórico
        return $this->suggestByHistory($transaction->user, $transaction->type);
    }

    /**
     * Encontra padrão na descrição
     */
    private function matchPattern(string $description): ?string
    {
        $description = strtolower($description);

        foreach ($this->patterns as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($description, $keyword) !== false) {
                    return $category;
                }
            }
        }

        return null;
    }

    /**
     * Sugere categoria mais usada do usuário para esse tipo de transação
     */
    private function suggestByHistory(User $user, string $type): ?Category
    {
        $mostUsed = Transaction::whereBelongsTo($user)
            ->where('type', $type)
            ->whereNotNull('category_id')
            ->select('category_id')
            ->groupBy('category_id')
            ->selectRaw('count(*) as total')
            ->orderByDesc('total')
            ->first();

        if ($mostUsed && $mostUsed->category_id) {
            return Category::find($mostUsed->category_id);
        }

        return null;
    }

    /**
     * Retorna confiança da categorização automática (0-1)
     */
    public function getConfidence(Transaction $transaction): float
    {
        if (!$transaction->description) {
            return 0.3; // Baixa confiança sem descrição
        }

        // Descrições mais longas = melhor contexto
        $descriptionLength = strlen($transaction->description);

        if ($descriptionLength > 50) {
            return 0.9;
        } elseif ($descriptionLength > 20) {
            return 0.7;
        }

        return 0.5;
    }

    /**
     * Valida se a categorização faz sentido
     */
    public function validateCategorization(Transaction $transaction): bool
    {
        if (!$transaction->category_id) {
            return false;
        }

        // Verificar se a categoria pertence ao usuário
        $category = Category::find($transaction->category_id);
        return $category && $category->user_id === $transaction->user_id;
    }

    /**
     * Treina com feedback do usuário
     * (Aqui poderia integrar ML em futuro)
     */
    public function recordFeedback(Transaction $transaction, bool $wasCorrect): void
    {
        // Registrar para análise posterior
        // Pode ser estendido para ML model training
    }
}
