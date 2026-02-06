<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RemittanceResource extends JsonResource
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
            'sender_name' => $this->sender_name,
            'recipient_name' => $this->recipient_name,
            'amount_sent' => (float) $this->amount_sent,
            'amount_received' => (float) $this->amount_received,
            'currency_from' => $this->currency_from,
            'currency_to' => $this->currency_to,
            'exchange_rate' => (float) $this->exchange_rate,
            'fee' => (float) $this->fee,
            'service_provider' => $this->service_provider,
            'transfer_date' => $this->transfer_date,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}