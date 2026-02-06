<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\FinancialScore;

class FinancialScorePolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, FinancialScore $financialScore): bool
    {
        return $user->id === $financialScore->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, FinancialScore $financialScore): bool
    {
        return $user->id === $financialScore->user_id;
    }

    public function delete(Profile $user, FinancialScore $financialScore): bool
    {
        return $user->id === $financialScore->user_id;
    }

    public function restore(Profile $user, FinancialScore $financialScore): bool
    {
        return $user->id === $financialScore->user_id;
    }

    public function forceDelete(Profile $user, FinancialScore $financialScore): bool
    {
        return $user->id === $financialScore->user_id;
    }
}
