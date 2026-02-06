<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KixikilaMembersResource extends JsonResource
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
            'kixikila_id' => $this->kixikila_id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'order_number' => (int) $this->order_number,
            'is_creator' => (bool) $this->is_creator,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}