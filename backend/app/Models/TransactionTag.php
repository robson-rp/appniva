<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionTag extends Model
{
    protected $fillable = [
        'transaction_id',
        'tag_id',
    ];

    //
}
