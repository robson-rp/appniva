<?php

namespace App\Policies;

use App\Models\User;
use App\Models\BondOtnr;

class BondOtnrPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, BondOtnr $bondOtnr): bool
    {
        return $user->id === $bondOtnr->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, BondOtnr $bondOtnr): bool
    {
        return $user->id === $bondOtnr->user_id;
    }

    public function delete(User $user, BondOtnr $bondOtnr): bool
    {
        return $user->id === $bondOtnr->user_id;
    }

    public function restore(User $user, BondOtnr $bondOtnr): bool
    {
        return $user->id === $bondOtnr->user_id;
    }

    public function forceDelete(User $user, BondOtnr $bondOtnr): bool
    {
        return $user->id === $bondOtnr->user_id;
    }
}
