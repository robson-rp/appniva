<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecurringTransactionResource extends JsonResource
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
            'account_id' => $this->account_id,
            'amount' => (float) $this->amount,
            'type' => $this->type,
            'frequency' => $this->frequency,
            'description' => $this->description,
            'is_active' => (bool) $this->is_active,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'last_executed_at' => $this->last_executed_at,
            'next_execution_date' => $this->next_execution_date,
            'category_id' => $this->category_id,
            'cost_center_id' => $this->cost_center_id,
            'account' => $this->whenLoaded('account', fn() => [
                'name' => $this->account->name,
                'currency' => $this->account->currency,
            ]),
            'category' => $this->whenLoaded('category', fn() => [
                'name' => $this->category->name,
                'color' => $this->category->color,
            ]),
            'cost_center' => $this->whenLoaded('costCenter', fn() => [
                'name' => $this->costCenter->name,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}