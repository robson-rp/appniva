<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\Investment;

class InvestmentPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, Investment $investment): bool
    {
        return $user->id === $investment->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, Investment $investment): bool
    {
        return $user->id === $investment->user_id;
    }

    public function delete(Profile $user, Investment $investment): bool
    {
        return $user->id === $investment->user_id;
    }

    public function restore(Profile $user, Investment $investment): bool
    {
        return $user->id === $investment->user_id;
    }

    public function forceDelete(Profile $user, Investment $investment): bool
    {
        return $user->id === $investment->user_id;
    }
}
