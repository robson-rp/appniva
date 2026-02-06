<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DebtResource extends JsonResource
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
            'principal_amount' => (float) $this->principal_amount,
            'current_balance' => (float) $this->current_balance,
            'type' => $this->type,
            'status' => $this->status,
            'interest_rate_annual' => (float) $this->interest_rate_annual,
            'installment_frequency' => $this->installment_frequency,
            'installment_amount' => (float) $this->installment_amount,
            'next_payment_date' => $this->next_payment_date,
            'institution' => $this->institution,
            'currency' => $this->currency ?? 'AOA',
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}