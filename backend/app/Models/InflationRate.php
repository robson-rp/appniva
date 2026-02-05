<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InflationRate extends Model
{
    protected $fillable = [
        'country',
        'rate',
        'year_month',
        'category',
    ];

    //
}
