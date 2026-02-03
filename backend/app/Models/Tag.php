<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo, BelongsToMany};


use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function transaction(): BelongsToMany
    {
        return $this->belongsToMany(Transaction::class, 'transaction_tags');
    }


}
