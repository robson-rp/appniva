<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class SplitExpense extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'creator_id',
        'description',
        'total_amount',
        'expense_date',
        'currency',
        'is_settled',
        'receipt_url',
        'share_token',
    ];

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'creator_id');
    }

    public function splitExpenseParticipants(): HasMany
    {
        return $this->hasMany(SplitExpenseParticipant::class);
    }


}
