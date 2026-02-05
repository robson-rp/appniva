<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class Remittance extends Model
{
    protected $fillable = [
        'recipient_name',
        'amount',
        'currency',
        'destination_country',
        'purpose',
        'send_date',
        'status',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }


}
