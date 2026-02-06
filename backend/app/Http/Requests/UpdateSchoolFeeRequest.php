<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSchoolFeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_name' => 'sometimes|string|max:255',
            'student_name' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric|min:0.01',
            'academic_year' => 'sometimes|string|size:4',
            'due_date' => 'sometimes|date',
            'education_level' => 'sometimes|string|max:255',
            'fee_type' => 'sometimes|string|max:255',
            'paid' => 'sometimes|boolean',
            'payment_proof_url' => 'nullable|string|max:255',
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
