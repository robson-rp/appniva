<?php

$migrationsDir = '/Users/robsonpaulo/Documents/GitHub/appniva/backend/database/migrations';
$files = glob($migrationsDir . '/*.php');

// Mapa de dependências correto
$order = [
    'users' => 1,
    'cache' => 2,
    'jobs' => 3,
    'personal_access_tokens' => 4,
    'profiles' => 5,
    'accounts' => 6,  // Deve vir antes de transactions
    'categories' => 7,
    'tags' => 8,
    'transactions' => 9,  // Depois de accounts
    'recurring_transactions' => 10,
    'transaction_tags' => 11,
    'budgets' => 12,
    'cost_centers' => 13,
    'cost_center_budgets' => 14,
    'goals' => 15,
    'goal_contributions' => 16,
    'scenarios' => 17,
    'debts' => 18,
    'debt_payments' => 19,
    'investments' => 20,
    'term_deposits' => 21,
    'bond_otnrs' => 22,
    'subscriptions' => 23,
    'school_fee_templates' => 24,
    'school_fees' => 25,
    'remittances' => 26,
    'split_expenses' => 27,
    'participant_groups' => 28,
    'split_expense_participants' => 29,
    'split_expense_payment_histories' => 30,
    'participant_group_members' => 31,
    'kixikilas' => 32,
    'kixikila_contributions' => 33,
    'kixikila_members' => 34,
    'insights' => 35,
    'category_prediction_logs' => 36,
    'daily_recommendations' => 37,
    'financial_scores' => 38,
    'bank_reconciliations' => 39,
    'financial_products' => 40,
    'product_requests' => 41,
    'exchange_rates' => 42,
    'exchange_rate_alerts' => 43,
    'inflation_rates' => 44,
    'uploaded_documents' => 45,
    'security_logs' => 46,
    'admin_audit_logs' => 47,
    'user_maturity_profiles' => 48,
    'user_mobile_preferences' => 49,
    'user_roles' => 50,
];

$renames = [];
foreach ($files as $file) {
    $basename = basename($file);
    if (preg_match('/create_(\w+)_table/', $basename, $m)) {
        $tableName = $m[1];
        if (isset($order[$tableName])) {
            $seq = str_pad($order[$tableName], 3, '0', STR_PAD_LEFT);
            $newBasename = "2026_02_03_145000" . $seq . "_create_" . $tableName . "_table.php";
            $renames[$file] = $migrationsDir . '/' . $newBasename;
        }
    }
}

// Executar renames
foreach ($renames as $old => $new) {
    if ($old !== $new) {
        rename($old, $new);
        echo "✓ Renamed: " . basename($old) . " → " . basename($new) . "\n";
    }
}

echo "\nTotal renamed: " . count($renames) . "\n";
?>
