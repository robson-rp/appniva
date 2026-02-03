<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class SplitExpensePaymentHistory extends Model
{
    //
    public function splitExpenseParticipant(): BelongsTo
    {
        return $this->belongsTo(SplitExpenseParticipant::class);
    }


}
