<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SchoolFeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'school_name' => $this->school_name,
            'student_name' => $this->student_name,
            'amount' => (float) $this->amount,
            'academic_year' => $this->academic_year,
            'due_date' => $this->due_date,
            'education_level' => $this->education_level,
            'fee_type' => $this->fee_type,
            'paid' => (bool) $this->paid,
            'payment_proof_url' => $this->payment_proof_url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}