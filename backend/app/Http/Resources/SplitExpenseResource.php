<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SplitExpenseResource extends JsonResource
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
            'creator_id' => $this->creator_id,
            'description' => $this->description,
            'total_amount' => (float) $this->total_amount,
            'expense_date' => $this->expense_date,
            'currency' => $this->currency,
            'is_settled' => (bool) $this->is_settled,
            'receipt_url' => $this->receipt_url,
            'share_token' => $this->share_token,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}