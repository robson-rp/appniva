<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo};
use Illuminate\Database\Eloquent\Model;

class Remittance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sender_name',
        'recipient_name',
        'amount_sent',
        'amount_received',
        'currency_from',
        'currency_to',
        'exchange_rate',
        'fee',
        'service_provider',
        'transfer_date',
        'status',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }


}
