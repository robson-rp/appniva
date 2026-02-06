<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TransactionTagController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\RecurringTransactionController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CostCenterController;
use App\Http\Controllers\CostCenterBudgetController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\GoalContributionController;
use App\Http\Controllers\ScenarioController;
use App\Http\Controllers\DebtController;
use App\Http\Controllers\DebtPaymentController;
use App\Http\Controllers\InvestmentController;
use App\Http\Controllers\TermDepositController;
use App\Http\Controllers\BondOtnrController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\SchoolFeeTemplateController;
use App\Http\Controllers\SchoolFeeController;
use App\Http\Controllers\RemittanceController;
use App\Http\Controllers\SplitExpenseController;
use App\Http\Controllers\SplitExpenseParticipantController;
use App\Http\Controllers\SplitExpensePaymentHistoryController;
use App\Http\Controllers\ParticipantGroupController;
use App\Http\Controllers\ParticipantGroupMemberController;
use App\Http\Controllers\KixikilaController;
use App\Http\Controllers\KixikilaMembersController;
use App\Http\Controllers\KixikilaContributionController;
use App\Http\Controllers\InsightController;
use App\Http\Controllers\CategoryPredictionLogController;
use App\Http\Controllers\DailyRecommendationController;
use App\Http\Controllers\FinancialScoreController;
use App\Http\Controllers\BankReconciliationController;
use App\Http\Controllers\FinancialProductController;
use App\Http\Controllers\ProductRequestController;
use App\Http\Controllers\ExchangeRateController;
use App\Http\Controllers\ExchangeRateAlertController;
use App\Http\Controllers\InflationRateController;
use App\Http\Controllers\UploadedDocumentController;
use App\Http\Controllers\SecurityLogController;
use App\Http\Controllers\AdminAuditLogController;
use App\Http\Controllers\UserRoleController;
use App\Http\Controllers\UserMaturityProfileController;
use App\Http\Controllers\UserMobilePreferenceController;
use App\Http\Controllers\AssistantController;
use App\Http\Controllers\OCRController;
use App\Http\Controllers\CategorizationController;

// API Version 1 - All current routes under /api/v1
Route::prefix('v1')->group(function () {

    Route::get('health', function () {
        return response()->json([
            'status' => 'ok',
            'message' => 'API is running',
            'timestamp' => now()->toIso8601String(),
        ]);
    });

    // Public Auth Routes
    Route::post('register', [\App\Http\Controllers\AuthController::class, 'register']);
    Route::post('login', [\App\Http\Controllers\AuthController::class, 'login']);
    Route::post('forgot-password', [\App\Http\Controllers\AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [\App\Http\Controllers\AuthController::class, 'resetPassword']);

    // Global API rate limiting applied to all API routes
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    
    // Auth Protected Routes
    Route::post('logout', [\App\Http\Controllers\AuthController::class, 'logout']);
    Route::get('me', [\App\Http\Controllers\AuthController::class, 'me']);

    // Profile
    Route::apiResource('profiles', ProfileController::class);

    // Financial Management - Critical operations with stricter limits
    Route::middleware(['throttle:financial', 'audit'])->group(function () {
        Route::apiResource('accounts', AccountController::class);
        Route::get('transactions/stats', [TransactionController::class, 'stats']);
        Route::get('transactions/stats/by-category', [TransactionController::class, 'statsByCategory']);
        Route::get('transactions/stats/trends', [TransactionController::class, 'trends']);
        Route::apiResource('transactions', TransactionController::class);
        Route::apiResource('recurring-transactions', RecurringTransactionController::class);
        Route::apiResource('debts', DebtController::class);
        Route::apiResource('debt-payments', DebtPaymentController::class);
        Route::apiResource('investments', InvestmentController::class);
        Route::apiResource('term-deposits', TermDepositController::class);
        Route::apiResource('bond-otnrs', BondOtnrController::class);
    });

    // Categories & Tags
    Route::apiResource('categories', CategoryController::class);
    
    Route::get('tags/stats', [TagController::class, 'stats']);
    Route::post('tags/{tag}/merge', [TagController::class, 'merge']);
    Route::apiResource('tags', TagController::class);
    
    Route::get('transactions/{transaction}/tags', [TransactionController::class, 'getTags']);
    Route::post('transactions/{transaction}/tags', [TransactionController::class, 'addTag']);
    Route::delete('transactions/{transaction}/tags/{tag}', [TransactionController::class, 'removeTag']);
    
    Route::apiResource('transaction-tags', TransactionTagController::class);

    // Budgeting
    Route::apiResource('budgets', BudgetController::class);
    Route::apiResource('cost-centers', CostCenterController::class);
    Route::apiResource('cost-center-budgets', CostCenterBudgetController::class);

    // Goals & Scenarios
    Route::apiResource('goals', GoalController::class);
    Route::apiResource('goal-contributions', GoalContributionController::class);
    Route::apiResource('scenarios', ScenarioController::class);

    // Goals & Scenarios
    Route::apiResource('goals', GoalController::class);
    Route::apiResource('goal-contributions', GoalContributionController::class);
    Route::apiResource('scenarios', ScenarioController::class);

    // Subscriptions & Services
    Route::apiResource('subscriptions', SubscriptionController::class);
    Route::apiResource('school-fee-templates', SchoolFeeTemplateController::class);
    Route::apiResource('school-fees', SchoolFeeController::class);
    Route::apiResource('remittances', RemittanceController::class);

    // Shared Expenses
    Route::apiResource('split-expenses', SplitExpenseController::class);
    Route::apiResource('split-expense-participants', SplitExpenseParticipantController::class);
    Route::apiResource('split-expense-payment-histories', SplitExpensePaymentHistoryController::class);
    Route::apiResource('participant-groups', ParticipantGroupController::class);
    Route::apiResource('participant-group-members', ParticipantGroupMemberController::class);

    // Savings Circles
    Route::apiResource('kixikilas', KixikilaController::class);
    Route::apiResource('kixikila-members', KixikilaMembersController::class);
    Route::apiResource('kixikila-contributions', KixikilaContributionController::class);

    // Analytics & Insights
    Route::apiResource('insights', InsightController::class);
    Route::apiResource('category-prediction-logs', CategoryPredictionLogController::class);
    Route::apiResource('daily-recommendations', DailyRecommendationController::class);
    Route::apiResource('financial-scores', FinancialScoreController::class);
    Route::apiResource('bank-reconciliations', BankReconciliationController::class);

    // Products & Documents
    Route::apiResource('financial-products', FinancialProductController::class);
    Route::apiResource('product-requests', ProductRequestController::class);
    Route::apiResource('exchange-rates', ExchangeRateController::class);
    Route::apiResource('exchange-rate-alerts', ExchangeRateAlertController::class);
    Route::apiResource('inflation-rates', InflationRateController::class);
    Route::apiResource('uploaded-documents', UploadedDocumentController::class);

    // Security & Logging (Read-only)
    Route::apiResource('security-logs', SecurityLogController::class)->only(['index']);
    Route::apiResource('admin-audit-logs', AdminAuditLogController::class)->only(['index']);

    // User Settings
    Route::apiResource('user-roles', UserRoleController::class);
    Route::apiResource('user-maturity-profiles', UserMaturityProfileController::class);
    Route::apiResource('user-mobile-preferences', UserMobilePreferenceController::class);
});

// AI-Powered Features - Stricter rate limiting (expensive operations)
Route::middleware(['auth:sanctum', 'throttle:ai'])->group(function () {
    Route::prefix('assistant')->group(function () {
        Route::get('summary', [AssistantController::class, 'getSummary']);
        Route::post('ask', [AssistantController::class, 'askQuestion']);
        Route::get('recommendations', [AssistantController::class, 'getRecommendations']);
    });

    Route::prefix('ocr')->group(function () {
        Route::post('process-receipt', [OCRController::class, 'processReceipt']);
        Route::post('parse-text', [OCRController::class, 'parseText']);
    });

    Route::prefix('categorization')->group(function () {
        Route::post('predict', [CategorizationController::class, 'predict']);
        Route::post('transactions/{transaction}/categorize', [CategorizationController::class, 'categorize']);
        Route::post('batch-categorize', [CategorizationController::class, 'batchCategorize']);
        Route::post('feedback', [CategorizationController::class, 'feedback']);
        Route::get('stats', [CategorizationController::class, 'stats']);
    });
});

// End of API v1
});
