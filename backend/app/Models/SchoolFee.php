<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo};
use Illuminate\Database\Eloquent\Model;

class SchoolFee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'school_name',
        'student_name',
        'amount',
        'academic_year',
        'due_date',
        'education_level',
        'fee_type',
        'paid',
        'payment_proof_url',
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
