<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\Remittance;

class RemittancePolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, Remittance $remittance): bool
    {
        return $user->id === $remittance->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, Remittance $remittance): bool
    {
        return $user->id === $remittance->user_id;
    }

    public function delete(Profile $user, Remittance $remittance): bool
    {
        return $user->id === $remittance->user_id;
    }

    public function restore(Profile $user, Remittance $remittance): bool
    {
        return $user->id === $remittance->user_id;
    }

    public function forceDelete(Profile $user, Remittance $remittance): bool
    {
        return $user->id === $remittance->user_id;
    }
}
