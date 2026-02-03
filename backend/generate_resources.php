<?php

// Gerar API Resources para todos os 47 modelos

$resourcesDir = '/Users/robsonpaulo/Documents/GitHub/appniva/backend/app/Http/Resources';
if (!is_dir($resourcesDir)) {
    mkdir($resourcesDir, 0755, true);
}

$models = [
    'Profile',
    'Account',
    'Category',
    'Tag',
    'Transaction',
    'RecurringTransaction',
    'TransactionTag',
    'Budget',
    'CostCenter',
    'CostCenterBudget',
    'Goal',
    'GoalContribution',
    'Scenario',
    'Debt',
    'DebtPayment',
    'Investment',
    'TermDeposit',
    'BondOtnr',
    'Subscription',
    'SchoolFeeTemplate',
    'SchoolFee',
    'Remittance',
    'SplitExpense',
    'SplitExpenseParticipant',
    'SplitExpensePaymentHistory',
    'ParticipantGroup',
    'ParticipantGroupMember',
    'Kixikila',
    'KixikilaMembers',
    'KixikilaContribution',
    'Insight',
    'CategoryPredictionLog',
    'DailyRecommendation',
    'FinancialScore',
    'BankReconciliation',
    'FinancialProduct',
    'ProductRequest',
    'ExchangeRate',
    'ExchangeRateAlert',
    'InflationRate',
    'UploadedDocument',
    'SecurityLog',
    'AdminAuditLog',
    'UserRole',
    'UserMaturityProfile',
    'UserMobilePreference',
];

$created = 0;
foreach ($models as $modelName) {
    $resourceFile = $resourcesDir . '/' . $modelName . 'Resource.php';
    
    if (file_exists($resourceFile)) {
        echo "⚠️  Resource exists: {$modelName}Resource\n";
        continue;
    }
    
    $content = <<<PHP
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class {$modelName}Resource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request \$request): array
    {
        return parent::toArray(\$request);
    }
}
PHP;
    
    file_put_contents($resourceFile, $content);
    $created++;
    echo "✓ Created: {$modelName}Resource\n";
}

echo "\n✓ Created $created API Resources\n";
?>
