<?php

/**
 * Script para implementar os 39 Controllers restantes
 *
 * Gera: Controllers, Form Requests, e Policies para todas as entidades pendentes
 */

$controllersConfig = [
    // Transações & Financeiro
    'RecurringTransactionController' => [
        'model' => 'RecurringTransaction',
        'relation' => 'recurringTransactions',
        'validationRules' => [
            'account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric',
            'type' => 'required|in:income,expense',
            'description' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'frequency' => 'required|in:daily,weekly,monthly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_active' => 'boolean',
        ],
    ],
    'TagController' => [
        'model' => 'Tag',
        'relation' => 'tags',
        'validationRules' => [
            'name' => 'required|string|max:50|unique:tags,name,{id}',
            'color' => 'nullable|string|max:7',
        ],
    ],
    'TransactionTagController' => [
        'model' => 'TransactionTag',
        'relation' => 'transactionTags',
        'validationRules' => [
            'transaction_id' => 'required|exists:transactions,id',
            'tag_id' => 'required|exists:tags,id',
        ],
    ],

    // Centros de Custo
    'CostCenterController' => [
        'model' => 'CostCenter',
        'relation' => 'costCenters',
        'validationRules' => [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ],
    ],
    'CostCenterBudgetController' => [
        'model' => 'CostCenterBudget',
        'relation' => 'costCenterBudgets',
        'validationRules' => [
            'cost_center_id' => 'required|exists:cost_centers,id',
            'budget_id' => 'required|exists:budgets,id',
            'allocated_amount' => 'required|numeric|min:0',
        ],
    ],

    // Metas & Contribuições
    'GoalContributionController' => [
        'model' => 'GoalContribution',
        'relation' => 'goalContributions',
        'validationRules' => [
            'goal_id' => 'required|exists:goals,id',
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'notes' => 'nullable|string',
        ],
    ],

    // Cenários & Simulações
    'ScenarioController' => [
        'model' => 'Scenario',
        'relation' => 'scenarios',
        'validationRules' => [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'type' => 'required|in:budget,investment,debt,goal',
            'params' => 'required|json',
            'result' => 'nullable|json',
        ],
    ],

    // Dívidas
    'DebtPaymentController' => [
        'model' => 'DebtPayment',
        'relation' => 'debtPayments',
        'validationRules' => [
            'debt_id' => 'required|exists:debts,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'principal_amount' => 'nullable|numeric|min:0',
            'interest_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ],
    ],

    // Investimentos
    'InvestmentController' => [
        'model' => 'Investment',
        'relation' => 'investments',
        'validationRules' => [
            'account_id' => 'required|exists:accounts,id',
            'type' => 'required|in:stock,bond,fund,crypto,real_estate,other',
            'name' => 'required|string|max:255',
            'amount_invested' => 'required|numeric|min:0',
            'current_value' => 'nullable|numeric|min:0',
            'purchase_date' => 'required|date',
            'maturity_date' => 'nullable|date',
            'annual_return' => 'nullable|numeric',
        ],
    ],
    'TermDepositController' => [
        'model' => 'TermDeposit',
        'relation' => 'termDeposits',
        'validationRules' => [
            'investment_id' => 'required|exists:investments,id',
            'bank_name' => 'required|string|max:100',
            'interest_rate' => 'required|numeric|min:0',
            'term_months' => 'required|integer|min:1',
            'auto_renew' => 'boolean',
        ],
    ],
    'BondOtnrController' => [
        'model' => 'BondOtnr',
        'relation' => 'bondOtnrs',
        'validationRules' => [
            'investment_id' => 'required|exists:investments,id',
            'bond_number' => 'required|string|max:50',
            'issue_date' => 'required|date',
            'coupon_rate' => 'required|numeric|min:0',
            'face_value' => 'required|numeric|min:0',
        ],
    ],

    // Assinaturas & Mensalidades
    'SubscriptionController' => [
        'model' => 'Subscription',
        'relation' => 'subscriptions',
        'validationRules' => [
            'name' => 'required|string|max:100',
            'amount' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,yearly,weekly',
            'next_billing_date' => 'required|date',
            'category_id' => 'nullable|exists:categories,id',
            'is_active' => 'boolean',
            'reminder_days' => 'nullable|integer|min:0',
        ],
    ],
    'SchoolFeeController' => [
        'model' => 'SchoolFee',
        'relation' => 'schoolFees',
        'validationRules' => [
            'template_id' => 'required|exists:school_fee_templates,id',
            'student_name' => 'required|string|max:100',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'is_paid' => 'boolean',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ],
    ],
    'SchoolFeeTemplateController' => [
        'model' => 'SchoolFeeTemplate',
        'relation' => 'schoolFeeTemplates',
        'validationRules' => [
            'school_name' => 'required|string|max:100',
            'grade_level' => 'required|string|max:50',
            'monthly_amount' => 'required|numeric|min:0',
            'enrollment_fee' => 'nullable|numeric|min:0',
            'start_month' => 'required|integer|min:1|max:12',
            'end_month' => 'required|integer|min:1|max:12',
        ],
    ],

    // Remessas
    'RemittanceController' => [
        'model' => 'Remittance',
        'relation' => 'remittances',
        'validationRules' => [
            'from_account_id' => 'required|exists:accounts,id',
            'to_account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'from_currency' => 'required|string|size:3',
            'to_currency' => 'required|string|size:3',
            'exchange_rate' => 'required|numeric|min:0',
            'fee' => 'nullable|numeric|min:0',
            'status' => 'required|in:pending,completed,cancelled',
            'date' => 'required|date',
            'recipient_name' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ],
    ],

    // Despesas Compartilhadas
    'SplitExpenseController' => [
        'model' => 'SplitExpense',
        'relation' => 'splitExpenses',
        'validationRules' => [
            'transaction_id' => 'required|exists:transactions,id',
            'group_id' => 'nullable|exists:participant_groups,id',
            'total_amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'status' => 'required|in:pending,settled,partially_paid',
        ],
    ],
    'SplitExpenseParticipantController' => [
        'model' => 'SplitExpenseParticipant',
        'relation' => 'splitExpenseParticipants',
        'validationRules' => [
            'split_expense_id' => 'required|exists:split_expenses,id',
            'participant_name' => 'required|string|max:100',
            'participant_email' => 'nullable|email|max:100',
            'share_amount' => 'required|numeric|min:0',
            'is_paid' => 'boolean',
        ],
    ],
    'SplitExpensePaymentHistoryController' => [
        'model' => 'SplitExpensePaymentHistory',
        'relation' => 'splitExpensePaymentHistories',
        'validationRules' => [
            'split_expense_participant_id' => 'required|exists:split_expense_participants,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ],
    ],
    'ParticipantGroupController' => [
        'model' => 'ParticipantGroup',
        'relation' => 'participantGroups',
        'validationRules' => [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
        ],
    ],
    'ParticipantGroupMemberController' => [
        'model' => 'ParticipantGroupMember',
        'relation' => 'participantGroupMembers',
        'validationRules' => [
            'group_id' => 'required|exists:participant_groups,id',
            'member_name' => 'required|string|max:100',
            'member_email' => 'nullable|email|max:100',
        ],
    ],

    // Kixikila (Poupança coletiva angolana)
    'KixikilaController' => [
        'model' => 'Kixikila',
        'relation' => 'kixikilas',
        'validationRules' => [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'total_amount' => 'required|numeric|min:0',
            'contribution_frequency' => 'required|in:weekly,monthly',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date',
            'is_active' => 'boolean',
        ],
    ],
    'KixikilaMembersController' => [
        'model' => 'KixikilaMembers',
        'relation' => 'kixikilaMembers',
        'validationRules' => [
            'kixikila_id' => 'required|exists:kixikilas,id',
            'member_name' => 'required|string|max:100',
            'contribution_amount' => 'required|numeric|min:0',
            'order_number' => 'nullable|integer|min:1',
            'has_received' => 'boolean',
        ],
    ],
    'KixikilaContributionController' => [
        'model' => 'KixikilaContribution',
        'relation' => 'kixikilaContributions',
        'validationRules' => [
            'kixikila_id' => 'required|exists:kixikilas,id',
            'member_id' => 'required|exists:kixikila_members,id',
            'amount' => 'required|numeric|min:0.01',
            'contribution_date' => 'required|date',
            'notes' => 'nullable|string',
        ],
    ],

    // Insights & Recomendações
    'InsightController' => [
        'model' => 'Insight',
        'relation' => 'insights',
        'validationRules' => [
            'type' => 'required|in:spending,saving,investment,debt,goal,general',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:high,medium,low',
            'is_read' => 'boolean',
            'related_entity_type' => 'nullable|string|max:50',
            'related_entity_id' => 'nullable|integer',
        ],
    ],
    'DailyRecommendationController' => [
        'model' => 'DailyRecommendation',
        'relation' => 'dailyRecommendations',
        'validationRules' => [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:spending,saving,investment,debt',
            'date' => 'required|date',
            'is_read' => 'boolean',
        ],
    ],
    'FinancialScoreController' => [
        'model' => 'FinancialScore',
        'relation' => 'financialScores',
        'validationRules' => [
            'score' => 'required|integer|min:0|max:100',
            'date' => 'required|date',
            'savings_rate_score' => 'nullable|numeric|min:0|max:100',
            'debt_ratio_score' => 'nullable|numeric|min:0|max:100',
            'investment_score' => 'nullable|numeric|min:0|max:100',
            'goal_progress_score' => 'nullable|numeric|min:0|max:100',
        ],
    ],

    // Taxas & Inflação
    'ExchangeRateController' => [
        'model' => 'ExchangeRate',
        'relation' => 'exchangeRates',
        'validationRules' => [
            'from_currency' => 'required|string|size:3',
            'to_currency' => 'required|string|size:3',
            'rate' => 'required|numeric|min:0',
            'date' => 'required|date',
            'source' => 'nullable|string|max:100',
        ],
    ],
    'ExchangeRateAlertController' => [
        'model' => 'ExchangeRateAlert',
        'relation' => 'exchangeRateAlerts',
        'validationRules' => [
            'from_currency' => 'required|string|size:3',
            'to_currency' => 'required|string|size:3',
            'target_rate' => 'required|numeric|min:0',
            'condition' => 'required|in:above,below',
            'is_active' => 'boolean',
            'triggered_at' => 'nullable|date',
        ],
    ],
    'InflationRateController' => [
        'model' => 'InflationRate',
        'relation' => 'inflationRates',
        'validationRules' => [
            'country' => 'required|string|max:2',
            'year' => 'required|integer|min:1900',
            'month' => 'required|integer|min:1|max:12',
            'rate' => 'required|numeric',
        ],
    ],

    // Produtos & Solicitações
    'FinancialProductController' => [
        'model' => 'FinancialProduct',
        'relation' => 'financialProducts',
        'validationRules' => [
            'name' => 'required|string|max:100',
            'type' => 'required|in:loan,investment,insurance,card',
            'provider' => 'required|string|max:100',
            'description' => 'nullable|string',
            'interest_rate' => 'nullable|numeric',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
        ],
    ],
    'ProductRequestController' => [
        'model' => 'ProductRequest',
        'relation' => 'productRequests',
        'validationRules' => [
            'product_id' => 'required|exists:financial_products,id',
            'requested_amount' => 'nullable|numeric|min:0',
            'status' => 'required|in:pending,approved,rejected',
            'request_date' => 'required|date',
            'response_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ],
    ],

    // Documentos & Reconciliação
    'UploadedDocumentController' => [
        'model' => 'UploadedDocument',
        'relation' => 'uploadedDocuments',
        'validationRules' => [
            'file_name' => 'required|string|max:255',
            'file_path' => 'required|string|max:500',
            'file_type' => 'required|string|max:50',
            'file_size' => 'required|integer|min:0',
            'related_entity_type' => 'nullable|string|max:50',
            'related_entity_id' => 'nullable|integer',
            'upload_date' => 'required|date',
        ],
    ],
    'BankReconciliationController' => [
        'model' => 'BankReconciliation',
        'relation' => 'bankReconciliations',
        'validationRules' => [
            'account_id' => 'required|exists:accounts,id',
            'statement_date' => 'required|date',
            'statement_balance' => 'required|numeric',
            'app_balance' => 'required|numeric',
            'difference' => 'nullable|numeric',
            'is_reconciled' => 'boolean',
            'notes' => 'nullable|string',
        ],
    ],
    'CategoryPredictionLogController' => [
        'model' => 'CategoryPredictionLog',
        'relation' => 'categoryPredictionLogs',
        'validationRules' => [
            'transaction_id' => 'required|exists:transactions,id',
            'predicted_category_id' => 'required|exists:categories,id',
            'confidence' => 'required|numeric|min:0|max:1',
            'was_accepted' => 'boolean',
            'feedback' => 'nullable|string',
        ],
    ],

    // Admin & Segurança
    'AdminAuditLogController' => [
        'model' => 'AdminAuditLog',
        'relation' => null, // Admin não filtra por user_id
        'validationRules' => [
            'admin_user_id' => 'required|exists:users,id',
            'action' => 'required|string|max:100',
            'target_user_id' => 'nullable|exists:users,id',
            'details' => 'nullable|json',
            'ip_address' => 'nullable|ip',
        ],
        'isAdmin' => true,
    ],
    'SecurityLogController' => [
        'model' => 'SecurityLog',
        'relation' => 'securityLogs',
        'validationRules' => [
            'event_type' => 'required|in:login,logout,password_change,suspicious_activity',
            'ip_address' => 'nullable|ip',
            'device_info' => 'nullable|json',
            'is_success' => 'boolean',
            'details' => 'nullable|string',
        ],
    ],
];

$controllersDir = __DIR__ . '/app/Http/Controllers';
$requestsDir = __DIR__ . '/app/Http/Requests';
$policiesDir = __DIR__ . '/app/Policies';

echo "🚀 Gerando Controllers, Form Requests e Policies...\n\n";

$generated = ['controllers' => 0, 'requests' => 0, 'policies' => 0];

foreach ($controllersConfig as $controllerName => $config) {
    $model = $config['model'];
    $relation = $config['relation'];
    $validationRules = $config['validationRules'];
    $isAdmin = $config['isAdmin'] ?? false;

    // 1. Gerar Form Requests (Store e Update)
    generateFormRequests($model, $validationRules, $requestsDir);
    $generated['requests'] += 2;

    // 2. Gerar Policy
    generatePolicy($model, $isAdmin, $policiesDir);
    $generated['policies']++;

    // 3. Gerar Controller
    generateController($controllerName, $model, $relation, $isAdmin, $controllersDir);
    $generated['controllers']++;

    echo "✓ Gerado: {$controllerName}\n";
}

echo "\n✅ Geração completa!\n";
echo "   Controllers: {$generated['controllers']}\n";
echo "   Form Requests: {$generated['requests']}\n";
echo "   Policies: {$generated['policies']}\n";

// ============================================================================
// FUNÇÕES DE GERAÇÃO
// ============================================================================

function generateFormRequests($model, $validationRules, $requestsDir)
{
    $storeRequestName = "Store{$model}Request";
    $updateRequestName = "Update{$model}Request";

    // Store Request
    $storeRules = array_filter($validationRules, function($rule) {
        return strpos($rule, '{id}') === false; // Remove regras com {id}
    });

    $storeContent = generateFormRequestContent($storeRequestName, $storeRules);
    file_put_contents("{$requestsDir}/{$storeRequestName}.php", $storeContent);

    // Update Request
    $updateRules = array_map(function($rule) use ($model) {
        return str_replace('{id}', "' . \$this->" . strtolower($model) . "->id . '", $rule);
    }, $validationRules);

    // Tornar campos opcionais no Update (exceto alguns críticos)
    $updateRules = array_map(function($rule) {
        if (strpos($rule, 'required') !== false &&
            strpos($rule, 'user_id') === false &&
            strpos($rule, 'id') === false) {
            return str_replace('required|', 'sometimes|', $rule);
        }
        return $rule;
    }, $updateRules);

    $updateContent = generateFormRequestContent($updateRequestName, $updateRules);
    file_put_contents("{$requestsDir}/{$updateRequestName}.php", $updateContent);
}

function generateFormRequestContent($className, $rules)
{
    $rulesArray = [];
    foreach ($rules as $field => $rule) {
        $rulesArray[] = "            '{$field}' => '{$rule}',";
    }
    $rulesString = implode("\n", $rulesArray);

    return <<<PHP
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class {$className} extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
{$rulesString}
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

PHP;
}

function generatePolicy($model, $isAdmin, $policiesDir)
{
    $policyName = "{$model}Policy";

    if ($isAdmin) {
        // Policy para Admin (sem filtro de user_id)
        $content = <<<PHP
<?php

namespace App\Policies;

use App\Models\User;
use App\Models\\{$model};

class {$policyName}
{
    public function viewAny(User \$user): bool
    {
        return \$user->is_admin; // Apenas admins
    }

    public function view(User \$user, {$model} \${strtolower($model)}): bool
    {
        return \$user->is_admin;
    }

    public function create(User \$user): bool
    {
        return \$user->is_admin;
    }

    public function update(User \$user, {$model} \${strtolower($model)}): bool
    {
        return \$user->is_admin;
    }

    public function delete(User \$user, {$model} \${strtolower($model)}): bool
    {
        return \$user->is_admin;
    }

    public function restore(User \$user, {$model} \${strtolower($model)}): bool
    {
        return \$user->is_admin;
    }

    public function forceDelete(User \$user, {$model} \${strtolower($model)}): bool
    {
        return \$user->is_admin;
    }
}

PHP;
    } else {
        // Policy normal (filtro por user_id)
        $content = <<<PHP
<?php

namespace App\Policies;

use App\Models\User;
use App\Models\\{$model};

class {$policyName}
{
    public function viewAny(User \$user): bool
    {
        return true;
    }

    public function view(User \$user, {$model} \${strtolower($model)}): bool
    {
        return \$user->id === \${strtolower($model)}->user_id;
    }

    public function create(User \$user): bool
    {
        return true;
    }

    public function update(User \$user, {$model} \${strtolower($model)}): bool
    {
        return \$user->id === \${strtolower($model)}->user_id;
    }

    public function delete(User \$user, {$model} \${strtolower($model)}): bool
    {
        return \$user->id === \${strtolower($model)}->user_id;
    }

    public function restore(User \$user, {$model} \${strtolower($model)}): bool
    {
        return \$user->id === \${strtolower($model)}->user_id;
    }

    public function forceDelete(User \$user, {$model} \${strtolower($model)}): bool
    {
        return \$user->id === \${strtolower($model)}->user_id;
    }
}

PHP;
    }

    file_put_contents("{$policiesDir}/{$policyName}.php", $content);
}

function generateController($controllerName, $model, $relation, $isAdmin, $controllersDir)
{
    $modelVar = lcfirst($model);
    $resourceName = "{$model}Resource";
    $storeRequest = "Store{$model}Request";
    $updateRequest = "Update{$model}Request";

    $indexQuery = $isAdmin
        ? "{$model}::query()"
        : "auth()->user()->{$relation}()";

    $content = <<<PHP
<?php

namespace App\Http\Controllers;

use App\Models\\{$model};
use App\Http\Requests\\{$storeRequest};
use App\Http\Requests\\{$updateRequest};
use App\Http\Resources\\{$resourceName};
use Illuminate\Http\Request;

class {$controllerName} extends Controller
{
    public function index(Request \$request)
    {
        \$query = {$indexQuery};

        \$perPage = \$request->input('per_page', 15);
        \$resources = \$query->paginate(\$perPage);

        return {$resourceName}::collection(\$resources);
    }

    public function store({$storeRequest} \$request)
    {
        \$validated = \$request->validated();

PHP;

    if (!$isAdmin) {
        $content .= <<<PHP
        \$validated['user_id'] = auth()->id();

PHP;
    }

    $content .= <<<PHP
        \${$modelVar} = {$model}::create(\$validated);

        return new {$resourceName}(\${$modelVar});
    }

    public function show({$model} \${$modelVar})
    {
PHP;

    if (!$isAdmin) {
        $content .= <<<PHP
        \$this->authorize('view', \${$modelVar});

PHP;
    }

    $content .= <<<PHP
        return new {$resourceName}(\${$modelVar});
    }

    public function update({$updateRequest} \$request, {$model} \${$modelVar})
    {
PHP;

    if (!$isAdmin) {
        $content .= <<<PHP
        \$this->authorize('update', \${$modelVar});

PHP;
    }

    $content .= <<<PHP
        \${$modelVar}->update(\$request->validated());

        return new {$resourceName}(\${$modelVar});
    }

    public function destroy({$model} \${$modelVar})
    {
PHP;

    if (!$isAdmin) {
        $content .= <<<PHP
        \$this->authorize('delete', \${$modelVar});

PHP;
    }

    $content .= <<<PHP
        \${$modelVar}->delete();

        return response()->noContent();
    }
}

PHP;

    file_put_contents("{$controllersDir}/{$controllerName}.php", $content);
}
