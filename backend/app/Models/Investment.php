<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};


use Illuminate\Database\Eloquent\Model;

class Investment extends Model
{
    protected $fillable = [
        'name',
        'type',
        'initial_amount',
        'current_amount',
        'start_date',
        'expected_return',
        'risk_level',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function termDeposits(): HasMany
    {
        return $this->hasMany(TermDeposit::class);
    }

    public function bondOtnrs(): HasMany
    {
        return $this->hasMany(BondOtnr::class);
    }


}
