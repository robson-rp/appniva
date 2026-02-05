<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class BondOtnr extends Model
{
    protected $fillable = [
        'investment_id',
        'issuer',
        'amount',
        'coupon_rate',
        'maturity_date',
        'currency',
    ];

    //
    public function investment(): BelongsTo
    {
        return $this->belongsTo(Investment::class);
    }


}
