<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class UserRole extends Model
{
    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }


}
