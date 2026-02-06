<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class UserMaturityProfile extends Model
{
    protected $fillable = [
        'user_id',
        'level',
        'has_debts',
        'has_investments',
        'uses_budget',
        'has_fixed_income',
        'primary_goal',
        'onboarding_completed',
        'progress_steps_completed',
        'total_progress_steps',
    ];

    protected $casts = [
        'has_debts' => 'boolean',
        'has_investments' => 'boolean',
        'uses_budget' => 'boolean',
        'has_fixed_income' => 'boolean',
        'onboarding_completed' => 'boolean',
        'progress_steps_completed' => 'integer',
        'total_progress_steps' => 'integer',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }


}
