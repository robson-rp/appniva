<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class TermDeposit extends Model
{
    protected $fillable = [
        'investment_id',
        'bank',
        'amount',
        'rate',
        'start_date',
        'maturity_date',
        'currency',
    ];

    //
    public function investment(): BelongsTo
    {
        return $this->belongsTo(Investment::class);
    }


}
