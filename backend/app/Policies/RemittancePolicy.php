<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Remittance;

class RemittancePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Remittance $remittance): bool
    {
        return $user->id === $remittance->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Remittance $remittance): bool
    {
        return $user->id === $remittance->user_id;
    }

    public function delete(User $user, Remittance $remittance): bool
    {
        return $user->id === $remittance->user_id;
    }

    public function restore(User $user, Remittance $remittance): bool
    {
        return $user->id === $remittance->user_id;
    }

    public function forceDelete(User $user, Remittance $remittance): bool
    {
        return $user->id === $remittance->user_id;
    }
}
