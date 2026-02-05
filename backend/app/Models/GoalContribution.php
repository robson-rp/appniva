<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class GoalContribution extends Model
{
    protected $fillable = [
        'goal_id',
        'amount',
        'contribution_date',
        'notes',
    ];

    //
    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }


}
