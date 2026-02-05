<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Debt extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'creditor',
        'amount',
        'interest_rate',
        'start_date',
        'end_date',
        'type',
        'status',
    ];

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function debtPayments(): HasMany
    {
        return $this->hasMany(DebtPayment::class);
    }

}
