<?php

$modelsDir = '/Users/robsonpaulo/Documents/GitHub/appniva/backend/app/Models';

// Mapear todos os relacionamentos
$relationships = [
    'Category' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'hasMany', 'model' => 'Transaction'],
        ['type' => 'hasMany', 'model' => 'Budget'],
        ['type' => 'hasMany', 'model' => 'RecurringTransaction'],
    ],
    'Tag' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'belongsToMany', 'model' => 'Transaction', 'pivot' => 'transaction_tags'],
    ],
    'Transaction' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'belongsTo', 'model' => 'Account'],
        ['type' => 'belongsTo', 'model' => 'Category'],
        ['type' => 'belongsTo', 'model' => 'CostCenter'],
        ['type' => 'belongsToMany', 'model' => 'Tag', 'pivot' => 'transaction_tags'],
    ],
    'RecurringTransaction' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'belongsTo', 'model' => 'Account'],
        ['type' => 'belongsTo', 'model' => 'Category'],
    ],
    'Budget' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'belongsTo', 'model' => 'Category'],
    ],
    'CostCenter' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'hasMany', 'model' => 'CostCenterBudget'],
        ['type' => 'hasMany', 'model' => 'Transaction'],
    ],
    'CostCenterBudget' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'belongsTo', 'model' => 'CostCenter'],
    ],
    'Goal' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'hasMany', 'model' => 'GoalContribution'],
    ],
    'GoalContribution' => [
        ['type' => 'belongsTo', 'model' => 'Goal'],
    ],
    'Scenario' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
    'Debt' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'hasMany', 'model' => 'DebtPayment'],
    ],
    'DebtPayment' => [
        ['type' => 'belongsTo', 'model' => 'Debt'],
    ],
    'Investment' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'hasMany', 'model' => 'TermDeposit'],
        ['type' => 'hasMany', 'model' => 'BondOtnr'],
    ],
    'TermDeposit' => [
        ['type' => 'belongsTo', 'model' => 'Investment'],
    ],
    'BondOtnr' => [
        ['type' => 'belongsTo', 'model' => 'Investment'],
    ],
    'Subscription' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
    'SchoolFeeTemplate' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'hasMany', 'model' => 'SchoolFee'],
    ],
    'SchoolFee' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'belongsTo', 'model' => 'SchoolFeeTemplate'],
    ],
    'Remittance' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
    'SplitExpense' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'hasMany', 'model' => 'SplitExpenseParticipant'],
    ],
    'SplitExpenseParticipant' => [
        ['type' => 'belongsTo', 'model' => 'SplitExpense'],
        ['type' => 'hasMany', 'model' => 'SplitExpensePaymentHistory'],
    ],
    'SplitExpensePaymentHistory' => [
        ['type' => 'belongsTo', 'model' => 'SplitExpenseParticipant'],
    ],
    'ParticipantGroup' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'hasMany', 'model' => 'ParticipantGroupMember'],
    ],
    'ParticipantGroupMember' => [
        ['type' => 'belongsTo', 'model' => 'ParticipantGroup'],
    ],
    'Kixikila' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
        ['type' => 'hasMany', 'model' => 'KixikilaMembers'],
        ['type' => 'hasMany', 'model' => 'KixikilaContribution'],
    ],
    'KixikilaMembers' => [
        ['type' => 'belongsTo', 'model' => 'Kixikila'],
    ],
    'KixikilaContribution' => [
        ['type' => 'belongsTo', 'model' => 'Kixikila'],
    ],
    'Insight' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
    'DailyRecommendation' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
    'FinancialScore' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
    'BankReconciliation' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
    'ProductRequest' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
    'ExchangeRateAlert' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
    'UploadedDocument' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
    'SecurityLog' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
    'AdminAuditLog' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
    'UserMaturityProfile' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
    'UserMobilePreference' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
    'UserRole' => [
        ['type' => 'belongsTo', 'model' => 'Profile', 'fk' => 'user_id'],
    ],
];

$updated = 0;

foreach ($relationships as $modelName => $rels) {
    $filePath = $modelsDir . '/' . $modelName . '.php';
    
    if (!file_exists($filePath)) {
        echo "⚠️  Model not found: $modelName\n";
        continue;
    }
    
    $content = file_get_contents($filePath);
    
    // Gerar métodos de relacionamento
    $relationshipMethods = '';
    $imports = "use Illuminate\Database\Eloquent\Relations\{";
    $relationTypes = array_unique(array_map(fn($r) => ucfirst($r['type']), $rels));
    $imports .= implode(', ', $relationTypes) . "};\n";
    
    foreach ($rels as $rel) {
        $methodName = lcfirst(str_replace('_', '', ucwords($rel['model'], '_')));
        $methodName = str_replace('Recurringtransaction', 'RecurringTransaction', $methodName);
        $methodName = str_replace('Schoolfee', 'SchoolFee', $methodName);
        $methodName = str_replace('Costcenter', 'CostCenter', $methodName);
        $methodName = str_replace('Splitexpense', 'SplitExpense', $methodName);
        $methodName = str_replace('Participantgroup', 'ParticipantGroup', $methodName);
        $methodName = str_replace('Kixikila', 'Kixikila', $methodName);
        
        // Pluralizar se for hasMany
        if ($rel['type'] === 'hasMany') {
            // Simples pluralização em inglês
            if (!str_ends_with($methodName, 's')) {
                $methodName .= 's';
            }
        }
        
        $returnType = ucfirst($rel['type']);
        $fk = $rel['fk'] ?? null;
        $pivot = $rel['pivot'] ?? null;
        
        $methodBody = "return \$this->";
        
        if ($rel['type'] === 'belongsTo') {
            $methodBody .= "belongsTo(" . $rel['model'] . "::class";
            if ($fk) $methodBody .= ", '$fk'";
            $methodBody .= ");\n";
        } elseif ($rel['type'] === 'hasMany') {
            $methodBody .= "hasMany(" . $rel['model'] . "::class);\n";
        } elseif ($rel['type'] === 'belongsToMany') {
            $methodBody .= "belongsToMany(" . $rel['model'] . "::class, '$pivot');\n";
        }
        
        $relationshipMethods .= "    public function {$methodName}(): {$returnType}\n    {\n        {$methodBody}    }\n\n";
    }
    
    // Atualizar arquivo
    if (strpos($content, 'use Illuminate\\Database\\Eloquent\\Relations') === false) {
        // Adicionar imports após namespace
        $content = preg_replace(
            '/(namespace.*?;)/',
            "$1\n\n{$imports}",
            $content
        );
    }
    
    // Adicionar métodos se não existirem
    if (strpos($content, 'public function') === false) {
        // Adicionar dentro da classe antes do fechamento
        $content = preg_replace(
            '/(\n\})$/',
            "\n{$relationshipMethods}\n}",
            $content
        );
    }
    
    file_put_contents($filePath, $content);
    $updated++;
    echo "✓ Updated: $modelName\n";
}

echo "\n✓ Updated $updated models with relationships\n";
?>
