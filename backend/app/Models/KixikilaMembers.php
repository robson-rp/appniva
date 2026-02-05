<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class KixikilaMembers extends Model
{
    protected $fillable = [
        'kixikila_id',
        'name',
        'email',
        'joined_date',
        'status',
    ];

    //
    public function kixikila(): BelongsTo
    {
        return $this->belongsTo(Kixikila::class);
    }


}
