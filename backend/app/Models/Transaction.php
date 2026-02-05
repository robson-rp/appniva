<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo, BelongsToMany};
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'account_id',
        'amount',
        'type',
        'date',
        'description',
        'category_id',
        'cost_center_id',
        'related_account_id',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function costCenter(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class);
    }

    public function tag(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'transaction_tags');
    }


}
