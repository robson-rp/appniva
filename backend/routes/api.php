<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TagController;
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

Route::middleware(['auth:sanctum'])->group(function () {
    // Profile
    Route::apiResource('profiles', ProfileController::class);
    
    // Financial Management
    Route::apiResource('accounts', AccountController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('tags', TagController::class);
    Route::apiResource('transactions', TransactionController::class);
    Route::apiResource('recurring-transactions', RecurringTransactionController::class);
    
    // Budgeting
    Route::apiResource('budgets', BudgetController::class);
    Route::apiResource('cost-centers', CostCenterController::class);
    Route::apiResource('cost-center-budgets', CostCenterBudgetController::class);
    
    // Goals & Scenarios
    Route::apiResource('goals', GoalController::class);
    Route::apiResource('goal-contributions', GoalContributionController::class);
    Route::apiResource('scenarios', ScenarioController::class);
    
    // Debt Management
    Route::apiResource('debts', DebtController::class);
    Route::apiResource('debt-payments', DebtPaymentController::class);
    
    // Investments
    Route::apiResource('investments', InvestmentController::class);
    Route::apiResource('term-deposits', TermDepositController::class);
    Route::apiResource('bond-otnrs', BondOtnrController::class);
    
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
    
    // Security & Logging
    Route::apiResource('security-logs', SecurityLogController::class)->only(['index']);
    Route::apiResource('admin-audit-logs', AdminAuditLogController::class)->only(['index']);
    
    // User Settings
    Route::apiResource('user-roles', UserRoleController::class);
    Route::apiResource('user-maturity-profiles', UserMaturityProfileController::class);
    Route::apiResource('user-mobile-preferences', UserMobilePreferenceController::class);
});
