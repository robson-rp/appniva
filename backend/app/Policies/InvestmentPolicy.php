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

    public function view(User $user, Investment ${strtolower(Investment)}): bool
    {
        return $user->id === ${strtolower(Investment)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Investment ${strtolower(Investment)}): bool
    {
        return $user->id === ${strtolower(Investment)}->user_id;
    }

    public function delete(User $user, Investment ${strtolower(Investment)}): bool
    {
        return $user->id === ${strtolower(Investment)}->user_id;
    }

    public function restore(User $user, Investment ${strtolower(Investment)}): bool
    {
        return $user->id === ${strtolower(Investment)}->user_id;
    }

    public function forceDelete(User $user, Investment ${strtolower(Investment)}): bool
    {
        return $user->id === ${strtolower(Investment)}->user_id;
    }
}
