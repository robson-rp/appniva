<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Investment;

class InvestmentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Investment $investment): bool
    {
        return $user->id === $investment->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Investment $investment): bool
    {
        return $user->id === $investment->user_id;
    }

    public function delete(User $user, Investment $investment): bool
    {
        return $user->id === $investment->user_id;
    }

    public function restore(User $user, Investment $investment): bool
    {
        return $user->id === $investment->user_id;
    }

    public function forceDelete(User $user, Investment $investment): bool
    {
        return $user->id === $investment->user_id;
    }
}
