<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDebtRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'principal_amount' => 'required|numeric|min:0.01',
            'current_balance' => 'required|numeric|min:0',
            'type' => 'required|in:personal_loan,credit_card,mortgage,auto_loan,student_loan,other',
            'status' => 'required|in:active,paid_off,defaulted',
            'interest_rate_annual' => 'nullable|numeric|min:0|max:1',
            'installment_frequency' => 'nullable|in:daily,weekly,biweekly,monthly,quarterly,annual',
            'installment_amount' => 'nullable|numeric|min:0',
            'next_payment_date' => 'nullable|date',
        ];
    }
    
    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'required' => 'O campo :attribute é obrigatório.',
            'email' => 'O campo :attribute deve ser um email válido.',
            'unique' => 'O valor de :attribute já existe.',
            'numeric' => 'O campo :attribute deve ser um número.',
            'date' => 'O campo :attribute deve ser uma data válida.',
            'min' => 'O campo :attribute deve ser no mínimo :min.',
            'max' => 'O campo :attribute deve ser no máximo :max.',
        ];
    }
}