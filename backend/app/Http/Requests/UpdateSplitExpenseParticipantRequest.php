<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSplitExpenseParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'split_expense_id' => 'required|exists:split_expenses,id',
            'participant_name' => 'sometimes|string|max:100',
            'participant_email' => 'nullable|email|max:100',
            'share_amount' => 'sometimes|numeric|min:0',
            'is_paid' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'O campo :attribute é obrigatório.',
            'email' => 'O campo :attribute deve ser um email válido.',
            'unique' => 'Este :attribute já está em uso.',
            'exists' => 'O :attribute selecionado não existe.',
            'numeric' => 'O campo :attribute deve ser numérico.',
            'min' => 'O campo :attribute deve ter no mínimo :min.',
            'max' => 'O campo :attribute deve ter no máximo :max.',
            'in' => 'O campo :attribute deve ser um dos seguintes valores: :values.',
            'date' => 'O campo :attribute deve ser uma data válida.',
            'after' => 'O campo :attribute deve ser posterior a :date.',
            'boolean' => 'O campo :attribute deve ser verdadeiro ou falso.',
            'json' => 'O campo :attribute deve ser um JSON válido.',
            'ip' => 'O campo :attribute deve ser um endereço IP válido.',
            'size' => 'O campo :attribute deve ter :size caracteres.',
        ];
    }
}
