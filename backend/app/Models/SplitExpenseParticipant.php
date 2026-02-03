<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};


use Illuminate\Database\Eloquent\Model;

class SplitExpenseParticipant extends Model
{
    //
    public function splitExpense(): BelongsTo
    {
        return $this->belongsTo(SplitExpense::class);
    }

    public function splitExpensePaymentHistorys(): HasMany
    {
        return $this->hasMany(SplitExpensePaymentHistory::class);
    }


}
