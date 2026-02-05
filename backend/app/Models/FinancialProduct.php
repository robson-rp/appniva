<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialProduct extends Model
{
    protected $fillable = [
        'name',
        'type',
        'description',
        'provider',
        'minimum_amount',
        'interest_rate',
    ];

    //
}
