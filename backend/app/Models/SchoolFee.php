<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class SchoolFee extends Model
{
    protected $fillable = [
        'school_fee_template_id',
        'student_name',
        'amount',
        'due_date',
        'status',
    ];

    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function schoolFeeTemplate(): BelongsTo
    {
        return $this->belongsTo(SchoolFeeTemplate::class);
    }


}
