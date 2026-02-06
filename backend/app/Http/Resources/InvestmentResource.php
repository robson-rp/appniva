<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvestmentResource extends JsonResource
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
            'investment_type' => $this->investment_type,
            'principal_amount' => (float) $this->principal_amount,
            'start_date' => $this->start_date,
            'maturity_date' => $this->maturity_date,
            'currency' => $this->currency,
            'institution_name' => $this->institution_name,
            'term_deposit' => new TermDepositResource($this->termDeposits->first()),
            'bond_otnr' => new BondOtnrResource($this->bondOtnrs->first()),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}