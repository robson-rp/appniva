<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SplitExpenseParticipantResource extends JsonResource
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
            'expense_id' => $this->expense_id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'amount_owed' => (float) $this->amount_owed,
            'amount_paid' => (float) $this->amount_paid,
            'is_creator' => (bool) $this->is_creator,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}