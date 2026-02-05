<?php

// Gerar Policies para autorização

$policiesDir = '/Users/robsonpaulo/Documents/GitHub/appniva/backend/app/Policies';
if (!is_dir($policiesDir)) {
    mkdir($policiesDir, 0755, true);
}

$models = ['Profile', 'Account', 'Category', 'Transaction', 'Goal', 'Debt', 'Budget'];

$created = 0;

foreach ($models as $modelName) {
    $policyFile = $policiesDir . '/' . $modelName . 'Policy.php';

    if (file_exists($policyFile)) {
        echo "⚠️  Policy exists: {$modelName}Policy\n";
        continue;
    }

    $modelVar = lcfirst($modelName);

    $content = <<<PHP
<?php

namespace App\Policies;

use App\Models\{$modelName};
use App\Models\User;

class {$modelName}Policy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User \$user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User \$user, {$modelName} \${$modelVar}): bool
    {
        return \$user->id === \${$modelVar}->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User \$user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User \$user, {$modelName} \${$modelVar}): bool
    {
        return \$user->id === \${$modelVar}->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User \$user, {$modelName} \${$modelVar}): bool
    {
        return \$user->id === \${$modelVar}->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User \$user, {$modelName} \${$modelVar}): bool
    {
        return \$user->id === \${$modelVar}->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User \$user, {$modelName} \${$modelVar}): bool
    {
        return \$user->id === \${$modelVar}->user_id;
    }
}
PHP;

    file_put_contents($policyFile, $content);
    $created++;
    echo "✓ Created: {$modelName}Policy\n";
}

echo "\n✓ Created $created Policies for authorization\n";
?>
