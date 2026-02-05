<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class SplitExpense extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'description',
        'total_amount',
        'currency',
        'date',
        'status',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function splitExpenseParticipants(): HasMany
    {
        return $this->hasMany(SplitExpenseParticipant::class);
    }


}
