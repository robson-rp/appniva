<?php

namespace App\Policies;

use App\Models\User;
use App\Models\FinancialScore;

class FinancialScorePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, FinancialScore ${strtolower(FinancialScore)}): bool
    {
        return $user->id === ${strtolower(FinancialScore)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, FinancialScore ${strtolower(FinancialScore)}): bool
    {
        return $user->id === ${strtolower(FinancialScore)}->user_id;
    }

    public function delete(User $user, FinancialScore ${strtolower(FinancialScore)}): bool
    {
        return $user->id === ${strtolower(FinancialScore)}->user_id;
    }

    public function restore(User $user, FinancialScore ${strtolower(FinancialScore)}): bool
    {
        return $user->id === ${strtolower(FinancialScore)}->user_id;
    }

    public function forceDelete(User $user, FinancialScore ${strtolower(FinancialScore)}): bool
    {
        return $user->id === ${strtolower(FinancialScore)}->user_id;
    }
}
