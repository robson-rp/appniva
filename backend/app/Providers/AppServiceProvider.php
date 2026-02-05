<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\BudgetService;
use App\Services\DebtService;
use App\Services\InvestmentService;
use App\Services\FinancialScoreService;
use App\Services\CategorizationService;
use App\Services\InsightService;
use App\Services\OCRService;
use App\Services\AssistantService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register all business logic services as singletons
        $this->app->singleton(BudgetService::class, function ($app) {
            return new BudgetService();
        });

        $this->app->singleton(DebtService::class, function ($app) {
            return new DebtService();
        });

        $this->app->singleton(InvestmentService::class, function ($app) {
            return new InvestmentService();
        });

        $this->app->singleton(FinancialScoreService::class, function ($app) {
            return new FinancialScoreService();
        });

        $this->app->singleton(CategorizationService::class, function ($app) {
            return new CategorizationService();
        });

        $this->app->singleton(InsightService::class, function ($app) {
            return new InsightService();
        });

        $this->app->singleton(OCRService::class, function ($app) {
            return new OCRService();
        });

        $this->app->singleton(AssistantService::class, function ($app) {
            return new AssistantService(
                $app->make(FinancialScoreService::class),
                $app->make(InsightService::class),
                $app->make(BudgetService::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
