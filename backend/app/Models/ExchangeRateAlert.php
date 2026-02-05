<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class ExchangeRateAlert extends Model
{
    protected $fillable = [
        'from_currency',
        'to_currency',
        'threshold_rate',
        'alert_type',
        'status',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }


}
