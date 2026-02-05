<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'month',
        'amount_limit',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }


}
