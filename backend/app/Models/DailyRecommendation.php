<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class DailyRecommendation extends Model
{
    protected $fillable = [
        'title',
        'description',
        'type',
        'priority',
        'action_url',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }


}
