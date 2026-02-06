<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetResource extends JsonResource
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
            'category_id' => $this->category_id,
            'month' => $this->month,
            'amount_limit' => (float) $this->amount_limit,
            'spent' => (float) ($this->spent ?? 0),
            'percentage' => (int) ($this->percentage ?? 0),
            'category' => [
                'id' => $this->category->id ?? null,
                'name' => $this->category->name ?? null,
                'icon' => $this->category->icon ?? null,
                'color' => $this->category->color ?? null,
            ],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}