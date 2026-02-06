<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSchoolFeeTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'school_name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'education_level' => 'required|string|max:255',
            'fee_type' => 'required|string|max:255',
            'is_recurring' => 'sometimes|boolean',
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
