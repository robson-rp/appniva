<?php

// Implementar Controllers para as 7 entidades principais

$controllersConfig = [
    'ProfileController' => [
        'model' => 'Profile',
        'storeRequest' => 'StoreProfileRequest',
        'updateRequest' => 'UpdateProfileRequest',
        'resource' => 'ProfileResource',
    ],
    'AccountController' => [
        'model' => 'Account',
        'storeRequest' => 'StoreAccountRequest',
        'updateRequest' => 'UpdateAccountRequest',
        'resource' => 'AccountResource',
    ],
    'CategoryController' => [
        'model' => 'Category',
        'storeRequest' => 'StoreCategoryRequest',
        'updateRequest' => 'UpdateCategoryRequest',
        'resource' => 'CategoryResource',
    ],
    'TransactionController' => [
        'model' => 'Transaction',
        'storeRequest' => 'StoreTransactionRequest',
        'updateRequest' => 'UpdateTransactionRequest',
        'resource' => 'TransactionResource',
    ],
    'GoalController' => [
        'model' => 'Goal',
        'storeRequest' => 'StoreGoalRequest',
        'updateRequest' => 'UpdateGoalRequest',
        'resource' => 'GoalResource',
    ],
    'DebtController' => [
        'model' => 'Debt',
        'storeRequest' => 'StoreDebtRequest',
        'updateRequest' => 'UpdateDebtRequest',
        'resource' => 'DebtResource',
    ],
    'BudgetController' => [
        'model' => 'Budget',
        'storeRequest' => 'StoreBudgetRequest',
        'updateRequest' => 'UpdateBudgetRequest',
        'resource' => 'BudgetResource',
    ],
];

$controllersDir = '/Users/robsonpaulo/Documents/GitHub/appniva/backend/app/Http/Controllers';
$updated = 0;

foreach ($controllersConfig as $controllerName => $config) {
    $controllerFile = $controllersDir . '/' . $controllerName . '.php';

    $code = <<<PHP
<?php

namespace App\Http\Controllers;

use App\\Models\\{$config['model']};
use App\\Http\\Requests\\{$config['storeRequest']};
use App\\Http\\Requests\\{$config['updateRequest']};
use App\\Http\\Resources\\{$config['resource']};
use Illuminate\\Http\\Request;

class {$controllerName} extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request \$request)
    {
        \$query = auth()->user()->{$config['model']}s();

        // Paginação
        \$perPage = \$request->input('per_page', 15);
        \$resources = \$query->paginate(\$perPage);

        return {$config['resource']}::collection(\$resources);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store({$config['storeRequest']} \$request)
    {
        \$validated = \$request->validated();
        \$validated['user_id'] = auth()->id();

        \${$config['model']} = {$config['model']}::create(\$validated);

        return new {$config['resource']}(\${$config['model']});
    }

    /**
     * Display the specified resource.
     */
    public function show({$config['model']} \${$config['model']})
    {
        \$this->authorize('view', \${$config['model']});

        return new {$config['resource']}(\${$config['model']});
    }

    /**
     * Update the specified resource in storage.
     */
    public function update({$config['updateRequest']} \$request, {$config['model']} \${$config['model']})
    {
        \$this->authorize('update', \${$config['model']});

        \${$config['model']}->update(\$request->validated());

        return new {$config['resource']}(\${$config['model']});
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy({$config['model']} \${$config['model']})
    {
        \$this->authorize('delete', \${$config['model']});

        \${$config['model']}->delete();

        return response()->noContent();
    }
}
PHP;

    file_put_contents($controllerFile, $code);
    $updated++;
    echo "✓ Updated: {$controllerName}\n";
}

echo "\n✓ Implemented {$updated} Controllers with CRUD logic\n";
?>
