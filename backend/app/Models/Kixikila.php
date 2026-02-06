<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Kixikila extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'contribution_amount',
        'frequency',
        'current_round',
        'total_members',
        'status',
        'currency',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function kixikilaMembers(): HasMany
    {
        return $this->hasMany(KixikilaMembers::class);
    }

    public function kixikilaContributions(): HasMany
    {
        return $this->hasMany(KixikilaContribution::class);
    }


}
