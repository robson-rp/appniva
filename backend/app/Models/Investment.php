<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Investment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'investment_type',
        'principal_amount',
        'start_date',
        'maturity_date',
        'currency',
        'institution_name',
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
