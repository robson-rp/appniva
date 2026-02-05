<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class DebtPayment extends Model
{
    protected $fillable = [
        'debt_id',
        'amount',
        'payment_date',
        'principal',
        'interest',
    ];

    //
    public function debt(): BelongsTo
    {
        return $this->belongsTo(Debt::class);
    }


}
