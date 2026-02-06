<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
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
            'category_id' => $this->category_id,
            'amount' => (float) $this->amount,
            'type' => $this->type,
            'date' => $this->date,
            'description' => $this->description,
            'status' => $this->status ?? 'completed',
            'cost_center_id' => $this->cost_center_id,
            'related_account_id' => $this->related_account_id,
            'account' => [
                'id' => $this->account->id ?? null,
                'name' => $this->account->name ?? null,
                'currency' => $this->account->currency ?? null,
            ],
            'category' => [
                'id' => $this->category->id ?? null,
                'name' => $this->category->name ?? null,
                'icon' => $this->category->icon ?? null,
                'color' => $this->category->color ?? null,
                'type' => $this->category->type ?? null,
            ],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}