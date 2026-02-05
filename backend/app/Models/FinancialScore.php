<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class FinancialScore extends Model
{
    protected $fillable = [
        'score',
        'income_health',
        'expense_health',
        'savings_rate',
        'debt_ratio',
        'assessment_date',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }


}
