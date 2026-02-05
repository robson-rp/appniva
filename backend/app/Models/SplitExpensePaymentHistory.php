<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class SplitExpensePaymentHistory extends Model
{
    protected $fillable = [
        'split_expense_participant_id',
        'amount',
        'payment_date',
        'notes',
    ];

    //
    public function splitExpenseParticipant(): BelongsTo
    {
        return $this->belongsTo(SplitExpenseParticipant::class);
    }


}
