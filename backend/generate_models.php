<?php

$models = [
    // User & Auth (4)
    'Profile',
    'UserRole',
    'UserMaturityProfile',
    'UserMobilePreference',

    // Financial core (6)
    'Account',
    'Category',
    'Tag',
    'Transaction',
    'TransactionTag',
    'RecurringTransaction',

    // Budgeting (3)
    'Budget',
    'CostCenter',
    'CostCenterBudget',

    // Goals & Planning (3)
    'Goal',
    'GoalContribution',
    'Scenario',

    // Debt management (2)
    'Debt',
    'DebtPayment',

    // Investments (3)
    'Investment',
    'TermDeposit',
    'BondOtnr',

    // Services (4)
    'Subscription',
    'SchoolFee',
    'SchoolFeeTemplate',
    'Remittance',

    // Split expenses (5)
    'SplitExpense',
    'SplitExpenseParticipant',
    'SplitExpensePaymentHistory',
    'ParticipantGroup',
    'ParticipantGroupMember',

    // Savings circles (3)
    'Kixikila',
    'KixikilaMembers',
    'KixikilaContribution',

    // Analytics (4)
    'Insight',
    'DailyRecommendation',
    'FinancialScore',
    'CategoryPredictionLog',

    // Advanced (9)
    'BankReconciliation',
    'FinancialProduct',
    'ProductRequest',
    'ExchangeRate',
    'ExchangeRateAlert',
    'InflationRate',
    'UploadedDocument',
    'SecurityLog',
    'AdminAuditLog',
];

echo "Total models to generate: " . count($models) . "\n\n";

foreach ($models as $model) {
    echo "Generating $model...\n";
    shell_exec("php artisan make:model $model -mcr -q 2>&1");
}

echo "\n✓ All " . count($models) . " models generated successfully!\n";
