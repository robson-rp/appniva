<?php

namespace App\Providers;

use App\Models\Profile;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\Goal;
use App\Models\Debt;
use App\Models\Budget;
use App\Policies\ProfilePolicy;
use App\Policies\AccountPolicy;
use App\Policies\CategoryPolicy;
use App\Policies\TransactionPolicy;
use App\Policies\GoalPolicy;
use App\Policies\DebtPolicy;
use App\Policies\BudgetPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Profile::class => ProfilePolicy::class,
        Account::class => AccountPolicy::class,
        Category::class => CategoryPolicy::class,
        Transaction::class => TransactionPolicy::class,
        Goal::class => GoalPolicy::class,
        Debt::class => DebtPolicy::class,
        Budget::class => BudgetPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}
