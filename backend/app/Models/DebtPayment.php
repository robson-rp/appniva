<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class DebtPayment extends Model
{
    //
    public function debt(): BelongsTo
    {
        return $this->belongsTo(Debt::class);
    }


}
