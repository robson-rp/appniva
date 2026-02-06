<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
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
            'amount' => (float) $this->amount,
            'billing_cycle' => $this->billing_cycle,
            'next_renewal_date' => $this->next_renewal_date,
            'is_active' => (bool) $this->is_active,
            'category_id' => $this->category_id,
            'account_id' => $this->account_id,
            'alert_days_before' => $this->alert_days_before,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}