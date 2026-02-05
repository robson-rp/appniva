<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoryPredictionLog extends Model
{
    protected $fillable = [
        'transaction_id',
        'predicted_category',
        'confidence_score',
        'actual_category',
        'correct',
    ];

    //
}
