<?php

namespace App\Providers;

use App\Models\{
    Profile, Account, Category, Transaction, Goal, Debt, Budget,
    RecurringTransaction, Tag, TransactionTag, CostCenter, CostCenterBudget,
    GoalContribution, Scenario, DebtPayment, Investment, TermDeposit, BondOtnr,
    Subscription, SchoolFee, SchoolFeeTemplate, Remittance,
    SplitExpense, SplitExpenseParticipant, SplitExpensePaymentHistory,
    ParticipantGroup, ParticipantGroupMember,
    Kixikila, KixikilaMembers, KixikilaContribution,
    Insight, DailyRecommendation, FinancialScore,
    ExchangeRate, ExchangeRateAlert, InflationRate,
    FinancialProduct, ProductRequest,
    UploadedDocument, BankReconciliation, CategoryPredictionLog,
    AdminAuditLog, SecurityLog
};

use App\Policies\{
    ProfilePolicy, AccountPolicy, CategoryPolicy, TransactionPolicy, GoalPolicy, DebtPolicy, BudgetPolicy,
    RecurringTransactionPolicy, TagPolicy, TransactionTagPolicy, CostCenterPolicy, CostCenterBudgetPolicy,
    GoalContributionPolicy, ScenarioPolicy, DebtPaymentPolicy, InvestmentPolicy, TermDepositPolicy, BondOtnrPolicy,
    SubscriptionPolicy, SchoolFeePolicy, SchoolFeeTemplatePolicy, RemittancePolicy,
    SplitExpensePolicy, SplitExpenseParticipantPolicy, SplitExpensePaymentHistoryPolicy,
    ParticipantGroupPolicy, ParticipantGroupMemberPolicy,
    KixikilaPolicy, KixikilaMembersPolicy, KixikilaContributionPolicy,
    InsightPolicy, DailyRecommendationPolicy, FinancialScorePolicy,
    ExchangeRatePolicy, ExchangeRateAlertPolicy, InflationRatePolicy,
    FinancialProductPolicy, ProductRequestPolicy,
    UploadedDocumentPolicy, BankReconciliationPolicy, CategoryPredictionLogPolicy,
    AdminAuditLogPolicy, SecurityLogPolicy
};

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // Core
        Profile::class => ProfilePolicy::class,
        Account::class => AccountPolicy::class,
        Category::class => CategoryPolicy::class,
        Transaction::class => TransactionPolicy::class,
        Goal::class => GoalPolicy::class,
        Debt::class => DebtPolicy::class,
        Budget::class => BudgetPolicy::class,
        
        // Transações
        RecurringTransaction::class => RecurringTransactionPolicy::class,
        Tag::class => TagPolicy::class,
        TransactionTag::class => TransactionTagPolicy::class,
        
        // Centros de Custo
        CostCenter::class => CostCenterPolicy::class,
        CostCenterBudget::class => CostCenterBudgetPolicy::class,
        
        // Metas
        GoalContribution::class => GoalContributionPolicy::class,
        Scenario::class => ScenarioPolicy::class,
        
        // Dívidas
        DebtPayment::class => DebtPaymentPolicy::class,
        
        // Investimentos
        Investment::class => InvestmentPolicy::class,
        TermDeposit::class => TermDepositPolicy::class,
        BondOtnr::class => BondOtnrPolicy::class,
        
        // Assinaturas
        Subscription::class => SubscriptionPolicy::class,
        SchoolFee::class => SchoolFeePolicy::class,
        SchoolFeeTemplate::class => SchoolFeeTemplatePolicy::class,
        Remittance::class => RemittancePolicy::class,
        
        // Despesas Compartilhadas
        SplitExpense::class => SplitExpensePolicy::class,
        SplitExpenseParticipant::class => SplitExpenseParticipantPolicy::class,
        SplitExpensePaymentHistory::class => SplitExpensePaymentHistoryPolicy::class,
        ParticipantGroup::class => ParticipantGroupPolicy::class,
        ParticipantGroupMember::class => ParticipantGroupMemberPolicy::class,
        
        // Kixikila
        Kixikila::class => KixikilaPolicy::class,
        KixikilaMembers::class => KixikilaMembersPolicy::class,
        KixikilaContribution::class => KixikilaContributionPolicy::class,
        
        // Insights
        Insight::class => InsightPolicy::class,
        DailyRecommendation::class => DailyRecommendationPolicy::class,
        FinancialScore::class => FinancialScorePolicy::class,
        
        // Taxas
        ExchangeRate::class => ExchangeRatePolicy::class,
        ExchangeRateAlert::class => ExchangeRateAlertPolicy::class,
        InflationRate::class => InflationRatePolicy::class,
        
        // Produtos
        FinancialProduct::class => FinancialProductPolicy::class,
        ProductRequest::class => ProductRequestPolicy::class,
        
        // Documentos
        UploadedDocument::class => UploadedDocumentPolicy::class,
        BankReconciliation::class => BankReconciliationPolicy::class,
        CategoryPredictionLog::class => CategoryPredictionLogPolicy::class,
        
        // Admin
        AdminAuditLog::class => AdminAuditLogPolicy::class,
        SecurityLog::class => SecurityLogPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}

