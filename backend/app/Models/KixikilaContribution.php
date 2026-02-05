<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class KixikilaContribution extends Model
{
    protected $fillable = [
        'kixikila_id',
        'amount',
        'contribution_date',
        'notes',
    ];

    //
    public function kixikila(): BelongsTo
    {
        return $this->belongsTo(Kixikila::class);
    }


}
