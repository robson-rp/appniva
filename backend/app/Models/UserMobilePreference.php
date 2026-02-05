<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class UserMobilePreference extends Model
{
    protected $fillable = [
        'home_layout',
        'widgets_enabled',
        'theme',
        'notifications_enabled',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }


}
