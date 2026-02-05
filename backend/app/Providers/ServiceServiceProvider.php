<?php

namespace App\Providers;

use App\Services\BudgetService;
use App\Services\DebtService;
use App\Services\InvestmentService;
use App\Services\FinancialScoreService;
use App\Services\CategorizationService;
use App\Services\InsightService;
use App\Services\TransactionService;
use Illuminate\Support\ServiceProvider;

class ServiceServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Singleton: uma instância para toda a aplicação
        $this->app->singleton(BudgetService::class);
        $this->app->singleton(DebtService::class);
        $this->app->singleton(InvestmentService::class);
        
        // FinancialScoreService depende de outras services
        $this->app->singleton(FinancialScoreService::class, function ($app) {
            return new FinancialScoreService(
                $app->make(BudgetService::class),
                $app->make(DebtService::class),
                $app->make(InvestmentService::class),
            );
        });
        
        $this->app->singleton(CategorizationService::class);
        
        // InsightService depende de outras services
        $this->app->singleton(InsightService::class, function ($app) {
            return new InsightService(
                $app->make(BudgetService::class),
                $app->make(DebtService::class),
                $app->make(InvestmentService::class),
            );
        });
        
        // TransactionService depende de CategorizationService
        $this->app->singleton(TransactionService::class, function ($app) {
            return new TransactionService(
                $app->make(CategorizationService::class),
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
