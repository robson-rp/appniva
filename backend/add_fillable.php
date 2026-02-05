<?php

// Mapear fillable para cada modelo baseado nas migrations
$fillableMap = [
    'Profile' => ['email', 'name', 'primary_currency', 'monthly_income', 'onboarding_completed', 'is_suspended'],
    'Account' => ['name', 'type', 'currency', 'current_balance', 'initial_balance', 'institution_name', 'is_active'],
    'Category' => ['name', 'type', 'icon', 'color', 'is_default'],
    'Tag' => ['name', 'color'],
    'Transaction' => ['account_id', 'amount', 'type', 'date', 'description', 'category_id', 'cost_center_id', 'related_account_id'],
    'RecurringTransaction' => ['account_id', 'amount', 'type', 'frequency', 'description', 'is_active', 'start_date', 'end_date', 'next_execution_date', 'category_id'],
    'Budget' => ['category_id', 'month', 'amount_limit'],
    'CostCenter' => ['name', 'description'],
    'CostCenterBudget' => ['cost_center_id', 'month', 'amount_limit'],
    'Goal' => ['name', 'target_amount', 'current_amount', 'deadline', 'category', 'priority', 'status'],
    'GoalContribution' => ['goal_id', 'amount', 'contribution_date', 'notes'],
    'Scenario' => ['name', 'description', 'initial_balance', 'monthly_savings', 'investment_return', 'inflation_rate', 'end_date'],
    'Debt' => ['name', 'creditor', 'amount', 'interest_rate', 'start_date', 'end_date', 'type', 'status'],
    'DebtPayment' => ['debt_id', 'amount', 'payment_date', 'principal', 'interest'],
    'Investment' => ['name', 'type', 'initial_amount', 'current_amount', 'start_date', 'expected_return', 'risk_level'],
    'TermDeposit' => ['investment_id', 'bank', 'amount', 'rate', 'start_date', 'maturity_date', 'currency'],
    'BondOtnr' => ['investment_id', 'issuer', 'amount', 'coupon_rate', 'maturity_date', 'currency'],
    'Subscription' => ['name', 'amount', 'currency', 'renewal_date', 'type', 'status'],
    'SchoolFeeTemplate' => ['name', 'amount', 'frequency', 'description'],
    'SchoolFee' => ['school_fee_template_id', 'student_name', 'amount', 'due_date', 'status'],
    'Remittance' => ['recipient_name', 'amount', 'currency', 'destination_country', 'purpose', 'send_date', 'status'],
    'SplitExpense' => ['description', 'total_amount', 'currency', 'date', 'status'],
    'SplitExpenseParticipant' => ['split_expense_id', 'name', 'share_amount'],
    'SplitExpensePaymentHistory' => ['split_expense_participant_id', 'amount', 'payment_date', 'notes'],
    'ParticipantGroup' => ['name', 'description', 'type'],
    'ParticipantGroupMember' => ['participant_group_id', 'name', 'email', 'role'],
    'Kixikila' => ['name', 'description', 'contribution_amount', 'frequency', 'target_members', 'status'],
    'KixikilaMembers' => ['kixikila_id', 'name', 'email', 'joined_date', 'status'],
    'KixikilaContribution' => ['kixikila_id', 'amount', 'contribution_date', 'notes'],
    'Insight' => ['title', 'description', 'category', 'recommendations', 'metrics'],
    'CategoryPredictionLog' => ['transaction_id', 'predicted_category', 'confidence_score', 'actual_category', 'correct'],
    'DailyRecommendation' => ['title', 'description', 'type', 'priority', 'action_url'],
    'FinancialScore' => ['score', 'income_health', 'expense_health', 'savings_rate', 'debt_ratio', 'assessment_date'],
    'BankReconciliation' => ['account_id', 'statement_date', 'statement_balance', 'reconciled_balance', 'notes', 'status'],
    'FinancialProduct' => ['name', 'type', 'description', 'provider', 'minimum_amount', 'interest_rate'],
    'ProductRequest' => ['product_name', 'description', 'requested_date', 'status'],
    'ExchangeRate' => ['from_currency', 'to_currency', 'rate', 'rate_date'],
    'ExchangeRateAlert' => ['from_currency', 'to_currency', 'threshold_rate', 'alert_type', 'status'],
    'InflationRate' => ['country', 'rate', 'year_month', 'category'],
    'UploadedDocument' => ['file_name', 'file_path', 'file_type', 'document_type', 'upload_date'],
    'SecurityLog' => ['action', 'ip_address', 'user_agent', 'details', 'status'],
    'AdminAuditLog' => ['action', 'entity_type', 'entity_id', 'changes', 'timestamp'],
    'UserMaturityProfile' => ['level', 'description', 'required_score', 'features_enabled'],
    'UserMobilePreference' => ['home_layout', 'widgets_enabled', 'theme', 'notifications_enabled'],
    'UserRole' => ['name', 'description', 'permissions'],
    'TransactionTag' => ['transaction_id', 'tag_id'],
];

$modelsDir = '/Users/robsonpaulo/Documents/GitHub/appniva/backend/app/Models';
$updated = 0;

foreach ($fillableMap as $modelName => $fields) {
    $filePath = $modelsDir . '/' . $modelName . '.php';
    
    if (!file_exists($filePath)) {
        echo "⚠️  Model not found: $modelName\n";
        continue;
    }
    
    $content = file_get_contents($filePath);
    
    // Gerar string de fillable
    $fillableStr = "protected \$fillable = [\n";
    foreach ($fields as $field) {
        $fillableStr .= "        '" . $field . "',\n";
    }
    $fillableStr .= "    ];";
    
    // Se já tem protected $fillable, substituir
    if (preg_match('/protected \$fillable = \[.*?\];/s', $content)) {
        $content = preg_replace(
            '/protected \$fillable = \[.*?\];/s',
            $fillableStr,
            $content
        );
    } else {
        // Caso contrário, adicionar após $guarded ou no início da classe
        if (strpos($content, 'protected $guarded') !== false) {
            $content = str_replace(
                'protected $guarded = [];',
                'protected $guarded = [];\n\n    ' . $fillableStr,
                $content
            );
        } else {
            // Adicionar após 'class ModelName extends Model {'
            $content = preg_replace(
                '/(class ' . $modelName . ' extends Model\n\s*\{)/m',
                "$1\n    " . $fillableStr . "\n",
                $content
            );
        }
    }
    
    file_put_contents($filePath, $content);
    $updated++;
    echo "✓ Added fillable to: $modelName\n";
}

echo "\n✓ Added fillable properties to $updated models\n";
?>
