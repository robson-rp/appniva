<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'target_amount',
        'current_amount',
        'deadline',
        'category',
        'priority',
        'status',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function goalContributions(): HasMany
    {
        return $this->hasMany(GoalContribution::class);
    }


}
