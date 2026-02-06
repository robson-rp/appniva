<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\Model;

class SchoolFeeTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'school_name',
        'amount',
        'education_level',
        'fee_type',
        'is_recurring',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function schoolFees(): HasMany
    {
        return $this->hasMany(SchoolFee::class);
    }


}
