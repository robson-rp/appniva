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

    public function view(User $user, FinancialScore $financialScore): bool
    {
        return $user->id === $financialScore->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, FinancialScore $financialScore): bool
    {
        return $user->id === $financialScore->user_id;
    }

    public function delete(User $user, FinancialScore $financialScore): bool
    {
        return $user->id === $financialScore->user_id;
    }

    public function restore(User $user, FinancialScore $financialScore): bool
    {
        return $user->id === $financialScore->user_id;
    }

    public function forceDelete(User $user, FinancialScore $financialScore): bool
    {
        return $user->id === $financialScore->user_id;
    }
}
