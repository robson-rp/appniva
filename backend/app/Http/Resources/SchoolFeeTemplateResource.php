<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SchoolFeeTemplateResource extends JsonResource
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
            'name' => $this->name,
            'school_name' => $this->school_name,
            'amount' => (float) $this->amount,
            'education_level' => $this->education_level,
            'fee_type' => $this->fee_type,
            'is_recurring' => (bool) $this->is_recurring,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}