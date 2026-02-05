<?php

// Criar Form Requests para cada entidade principal com validação base

$requestsDir = '/Users/robsonpaulo/Documents/GitHub/appniva/backend/app/Http/Requests';
if (!is_dir($requestsDir)) {
    mkdir($requestsDir, 0755, true);
}

$validationRules = [
    'StoreProfile' => [
        'email' => 'required|string|email|unique:profiles',
        'name' => 'required|string|max:255',
        'primary_currency' => 'required|string|size:3',
        'monthly_income' => 'nullable|numeric|min:0',
        'onboarding_completed' => 'boolean',
        'is_suspended' => 'boolean',
    ],
    'UpdateProfile' => [
        'email' => 'sometimes|string|email|unique:profiles,email',
        'name' => 'sometimes|string|max:255',
        'primary_currency' => 'sometimes|string|size:3',
        'monthly_income' => 'sometimes|numeric|min:0',
        'onboarding_completed' => 'sometimes|boolean',
        'is_suspended' => 'sometimes|boolean',
    ],
    'StoreAccount' => [
        'name' => 'required|string|max:255',
        'type' => 'required|in:savings,checking,investment,credit_card',
        'currency' => 'required|string|size:3',
        'current_balance' => 'required|numeric',
        'initial_balance' => 'nullable|numeric',
        'institution_name' => 'nullable|string|max:255',
        'is_active' => 'boolean',
    ],
    'UpdateAccount' => [
        'name' => 'sometimes|string|max:255',
        'type' => 'sometimes|in:savings,checking,investment,credit_card',
        'currency' => 'sometimes|string|size:3',
        'current_balance' => 'sometimes|numeric',
        'initial_balance' => 'sometimes|numeric|nullable',
        'institution_name' => 'sometimes|string|max:255|nullable',
        'is_active' => 'sometimes|boolean',
    ],
    'StoreCategory' => [
        'name' => 'required|string|max:255',
        'type' => 'required|in:expense,income',
        'icon' => 'nullable|string|max:50',
        'color' => 'nullable|string|max:7',
        'is_default' => 'boolean',
    ],
    'UpdateCategory' => [
        'name' => 'sometimes|string|max:255',
        'type' => 'sometimes|in:expense,income',
        'icon' => 'sometimes|string|max:50|nullable',
        'color' => 'sometimes|string|max:7|nullable',
        'is_default' => 'sometimes|boolean',
    ],
    'StoreTransaction' => [
        'account_id' => 'required|exists:accounts,id',
        'amount' => 'required|numeric|min:0.01',
        'type' => 'required|in:income,expense,transfer',
        'date' => 'required|date',
        'description' => 'nullable|string|max:500',
        'category_id' => 'nullable|exists:categories,id',
        'cost_center_id' => 'nullable|exists:cost_centers,id',
        'related_account_id' => 'nullable|exists:accounts,id',
    ],
    'UpdateTransaction' => [
        'account_id' => 'sometimes|exists:accounts,id',
        'amount' => 'sometimes|numeric|min:0.01',
        'type' => 'sometimes|in:income,expense,transfer',
        'date' => 'sometimes|date',
        'description' => 'sometimes|string|max:500|nullable',
        'category_id' => 'sometimes|exists:categories,id|nullable',
        'cost_center_id' => 'sometimes|exists:cost_centers,id|nullable',
        'related_account_id' => 'sometimes|exists:accounts,id|nullable',
    ],
    'StoreGoal' => [
        'name' => 'required|string|max:255',
        'target_amount' => 'required|numeric|min:0.01',
        'current_amount' => 'nullable|numeric|min:0',
        'deadline' => 'nullable|date|after:today',
        'category' => 'nullable|string|max:100',
        'priority' => 'required|in:low,medium,high',
        'status' => 'required|in:active,paused,completed',
    ],
    'UpdateGoal' => [
        'name' => 'sometimes|string|max:255',
        'target_amount' => 'sometimes|numeric|min:0.01',
        'current_amount' => 'sometimes|numeric|min:0',
        'deadline' => 'sometimes|date|after:today|nullable',
        'category' => 'sometimes|string|max:100|nullable',
        'priority' => 'sometimes|in:low,medium,high',
        'status' => 'sometimes|in:active,paused,completed',
    ],
    'StoreDebt' => [
        'name' => 'required|string|max:255',
        'creditor' => 'required|string|max:255',
        'amount' => 'required|numeric|min:0.01',
        'interest_rate' => 'nullable|numeric|min:0',
        'start_date' => 'required|date',
        'end_date' => 'nullable|date|after:start_date',
        'type' => 'required|in:personal,mortgage,auto,credit_card,student,other',
        'status' => 'required|in:active,paid,overdue',
    ],
    'UpdateDebt' => [
        'name' => 'sometimes|string|max:255',
        'creditor' => 'sometimes|string|max:255',
        'amount' => 'sometimes|numeric|min:0.01',
        'interest_rate' => 'sometimes|numeric|min:0|nullable',
        'start_date' => 'sometimes|date',
        'end_date' => 'sometimes|date|after:start_date|nullable',
        'type' => 'sometimes|in:personal,mortgage,auto,credit_card,student,other',
        'status' => 'sometimes|in:active,paid,overdue',
    ],
    'StoreBudget' => [
        'category_id' => 'required|exists:categories,id',
        'month' => 'required|date_format:Y-m',
        'amount_limit' => 'required|numeric|min:0.01',
    ],
    'UpdateBudget' => [
        'category_id' => 'sometimes|exists:categories,id',
        'month' => 'sometimes|date_format:Y-m',
        'amount_limit' => 'sometimes|numeric|min:0.01',
    ],
];

$created = 0;

foreach ($validationRules as $requestName => $rules) {
    $requestFile = $requestsDir . '/' . $requestName . 'Request.php';
    
    if (file_exists($requestFile)) {
        echo "⚠️  Request exists: {$requestName}Request\n";
        continue;
    }
    
    // Gerar rules array formatado
    $rulesStr = "        return [\n";
    foreach ($rules as $field => $fieldRules) {
        $rulesStr .= "            '" . $field . "' => '" . $fieldRules . "',\n";
    }
    $rulesStr .= "        ];";
    
    $isStore = str_contains($requestName, 'Store');
    $actionType = $isStore ? 'store' : 'update';
    
    $content = <<<PHP
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class {$requestName}Request extends FormRequest
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
$rulesStr
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
PHP;
    
    file_put_contents($requestFile, $content);
    $created++;
    echo "✓ Created: {$requestName}Request\n";
}

echo "\n✓ Created $created Form Requests\n";
?>
