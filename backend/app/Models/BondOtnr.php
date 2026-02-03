<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class BondOtnr extends Model
{
    //
    public function investment(): BelongsTo
    {
        return $this->belongsTo(Investment::class);
    }


}
