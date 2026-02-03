<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Profile extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class, 'user_id');
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class, 'user_id');
    }

    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class, 'user_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'user_id');
    }

    public function recurringTransactions(): HasMany
    {
        return $this->hasMany(RecurringTransaction::class, 'user_id');
    }

    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class, 'user_id');
    }

    public function costCenters(): HasMany
    {
        return $this->hasMany(CostCenter::class, 'user_id');
    }

    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class, 'user_id');
    }

    public function scenarios(): HasMany
    {
        return $this->hasMany(Scenario::class, 'user_id');
    }

    public function debts(): HasMany
    {
        return $this->hasMany(Debt::class, 'user_id');
    }

    public function investments(): HasMany
    {
        return $this->hasMany(Investment::class, 'user_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'user_id');
    }

    public function remittances(): HasMany
    {
        return $this->hasMany(Remittance::class, 'user_id');
    }

    public function schoolFeeTemplates(): HasMany
    {
        return $this->hasMany(SchoolFeeTemplate::class, 'user_id');
    }

    public function schoolFees(): HasMany
    {
        return $this->hasMany(SchoolFee::class, 'user_id');
    }

    public function splitExpenses(): HasMany
    {
        return $this->hasMany(SplitExpense::class, 'user_id');
    }

    public function participantGroups(): HasMany
    {
        return $this->hasMany(ParticipantGroup::class, 'user_id');
    }

    public function kixikilas(): HasMany
    {
        return $this->hasMany(Kixikila::class, 'user_id');
    }

    public function insights(): HasMany
    {
        return $this->hasMany(Insight::class, 'user_id');
    }

    public function dailyRecommendations(): HasMany
    {
        return $this->hasMany(DailyRecommendation::class, 'user_id');
    }

    public function financialScores(): HasMany
    {
        return $this->hasMany(FinancialScore::class, 'user_id');
    }

    public function bankReconciliations(): HasMany
    {
        return $this->hasMany(BankReconciliation::class, 'user_id');
    }

    public function productRequests(): HasMany
    {
        return $this->hasMany(ProductRequest::class, 'user_id');
    }

    public function exchangeRateAlerts(): HasMany
    {
        return $this->hasMany(ExchangeRateAlert::class, 'user_id');
    }

    public function uploadedDocuments(): HasMany
    {
        return $this->hasMany(UploadedDocument::class, 'user_id');
    }

    public function securityLogs(): HasMany
    {
        return $this->hasMany(SecurityLog::class, 'user_id');
    }

    public function adminAuditLogs(): HasMany
    {
        return $this->hasMany(AdminAuditLog::class, 'user_id');
    }

    public function userMobilePreferences(): HasMany
    {
        return $this->hasMany(UserMobilePreference::class, 'user_id');
    }

    public function userMaturityProfiles(): HasMany
    {
        return $this->hasMany(UserMaturityProfile::class, 'user_id');
    }

    public function userRoles(): HasMany
    {
        return $this->hasMany(UserRole::class, 'user_id');
    }

    public function costCenterBudgets(): HasMany
    {
        return $this->hasMany(CostCenterBudget::class, 'user_id');
    }
}
