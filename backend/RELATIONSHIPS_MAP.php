<?php

// Mapear todos os relacionamentos baseado na análise das migrations

$relationships = [
    'Profile' => [
        'hasMany:Account',
        'hasMany:Category',
        'hasMany:Tag',
        'hasMany:Transaction',
        'hasMany:RecurringTransaction',
        'hasMany:Budget',
        'hasMany:CostCenter',
        'hasMany:Goal',
        'hasMany:Scenario',
        'hasMany:Debt',
        'hasMany:Investment',
        'hasMany:Subscription',
        'hasMany:Remittance',
        'hasMany:SchoolFeeTemplate',
        'hasMany:SchoolFee',
        'hasMany:SplitExpense',
        'hasMany:ParticipantGroup',
        'hasMany:Kixikila',
        'hasMany:Insight',
        'hasMany:DailyRecommendation',
        'hasMany:FinancialScore',
        'hasMany:BankReconciliation',
        'hasMany:ProductRequest',
        'hasMany:ExchangeRateAlert',
        'hasMany:UploadedDocument',
        'hasMany:SecurityLog',
        'hasMany:AdminAuditLog',
        'hasMany:UserMobilePreference',
        'hasMany:UserMaturityProfile',
        'hasMany:UserRole',
    ],
    
    'Account' => [
        'belongsTo:Profile',
        'hasMany:Transaction',
        'hasMany:RecurringTransaction',
    ],
    
    'Category' => [
        'belongsTo:Profile',
        'hasMany:Transaction',
        'hasMany:Budget',
        'hasMany:RecurringTransaction',
    ],
    
    'Tag' => [
        'belongsTo:Profile',
        'belongsToMany:Transaction,transaction_tags',
    ],
    
    'Transaction' => [
        'belongsTo:Profile',
        'belongsTo:Account',
        'belongsTo:Category',
        'belongsTo:CostCenter',
        'belongsTo:RelatedAccount,account,related_account_id',
        'belongsToMany:Tag,transaction_tags',
    ],
    
    'RecurringTransaction' => [
        'belongsTo:Profile',
        'belongsTo:Account',
        'belongsTo:Category',
    ],
    
    'Budget' => [
        'belongsTo:Profile',
        'belongsTo:Category',
    ],
    
    'CostCenter' => [
        'belongsTo:Profile',
        'hasMany:CostCenterBudget',
        'hasMany:Transaction',
    ],
    
    'CostCenterBudget' => [
        'belongsTo:Profile',
        'belongsTo:CostCenter',
    ],
    
    'Goal' => [
        'belongsTo:Profile',
        'hasMany:GoalContribution',
    ],
    
    'GoalContribution' => [
        'belongsTo:Goal',
    ],
    
    'Scenario' => [
        'belongsTo:Profile',
    ],
    
    'Debt' => [
        'belongsTo:Profile',
        'hasMany:DebtPayment',
    ],
    
    'DebtPayment' => [
        'belongsTo:Debt',
    ],
    
    'Investment' => [
        'belongsTo:Profile',
        'hasMany:TermDeposit',
        'hasMany:BondOtnr',
    ],
    
    'TermDeposit' => [
        'belongsTo:Investment',
    ],
    
    'BondOtnr' => [
        'belongsTo:Investment',
    ],
    
    'Subscription' => [
        'belongsTo:Profile',
    ],
    
    'Remittance' => [
        'belongsTo:Profile',
    ],
    
    'SchoolFeeTemplate' => [
        'belongsTo:Profile',
        'hasMany:SchoolFee',
    ],
    
    'SchoolFee' => [
        'belongsTo:Profile',
        'belongsTo:SchoolFeeTemplate',
    ],
    
    'SplitExpense' => [
        'belongsTo:Profile',
        'hasMany:SplitExpenseParticipant',
        'hasMany:SplitExpensePaymentHistory',
    ],
    
    'SplitExpenseParticipant' => [
        'belongsTo:SplitExpense',
        'hasMany:SplitExpensePaymentHistory',
    ],
    
    'SplitExpensePaymentHistory' => [
        'belongsTo:SplitExpenseParticipant',
    ],
    
    'ParticipantGroup' => [
        'belongsTo:Profile',
        'hasMany:ParticipantGroupMember',
    ],
    
    'ParticipantGroupMember' => [
        'belongsTo:ParticipantGroup',
    ],
    
    'Kixikila' => [
        'belongsTo:Profile',
        'hasMany:KixikilaMembers',
        'hasMany:KixikilaContribution',
    ],
    
    'KixikilaMembers' => [
        'belongsTo:Kixikila',
    ],
    
    'KixikilaContribution' => [
        'belongsTo:Kixikila',
    ],
    
    'Insight' => [
        'belongsTo:Profile',
    ],
    
    'CategoryPredictionLog' => [
        // standalone
    ],
    
    'DailyRecommendation' => [
        'belongsTo:Profile',
    ],
    
    'FinancialScore' => [
        'belongsTo:Profile',
    ],
    
    'BankReconciliation' => [
        'belongsTo:Profile',
    ],
    
    'FinancialProduct' => [
        // standalone, pode ter muitos
    ],
    
    'ProductRequest' => [
        'belongsTo:Profile',
    ],
    
    'ExchangeRate' => [
        // standalone, sistema
    ],
    
    'ExchangeRateAlert' => [
        'belongsTo:Profile',
    ],
    
    'InflationRate' => [
        // standalone, sistema
    ],
    
    'UploadedDocument' => [
        'belongsTo:Profile',
    ],
    
    'SecurityLog' => [
        'belongsTo:Profile',
    ],
    
    'AdminAuditLog' => [
        'belongsTo:Profile',
    ],
    
    'UserMaturityProfile' => [
        'belongsTo:Profile',
    ],
    
    'UserMobilePreference' => [
        'belongsTo:Profile',
    ],
    
    'UserRole' => [
        'belongsTo:Profile',
    ],
];

echo "Relacionamentos mapeados para " . count($relationships) . " modelos\n";
echo "Total de relacionamentos: " . array_sum(array_map('count', $relationships)) . "\n";

// Imprimir para referência
foreach ($relationships as $model => $rels) {
    if (!empty($rels)) {
        echo "\n$model:\n";
        foreach ($rels as $rel) {
            echo "  - $rel\n";
        }
    }
}
?>
