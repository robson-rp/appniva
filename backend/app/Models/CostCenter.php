<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\Model;

class CostCenter extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'name',
        'type',
        'description',
        'is_active',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function costCenterBudgets(): HasMany
    {
        return $this->hasMany(CostCenterBudget::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }


}
