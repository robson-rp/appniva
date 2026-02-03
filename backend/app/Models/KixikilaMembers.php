<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class KixikilaMembers extends Model
{
    //
    public function kixikila(): BelongsTo
    {
        return $this->belongsTo(Kixikila::class);
    }


}
