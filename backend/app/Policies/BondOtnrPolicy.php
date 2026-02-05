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

    public function view(User $user, BondOtnr ${strtolower(BondOtnr)}): bool
    {
        return $user->id === ${strtolower(BondOtnr)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, BondOtnr ${strtolower(BondOtnr)}): bool
    {
        return $user->id === ${strtolower(BondOtnr)}->user_id;
    }

    public function delete(User $user, BondOtnr ${strtolower(BondOtnr)}): bool
    {
        return $user->id === ${strtolower(BondOtnr)}->user_id;
    }

    public function restore(User $user, BondOtnr ${strtolower(BondOtnr)}): bool
    {
        return $user->id === ${strtolower(BondOtnr)}->user_id;
    }

    public function forceDelete(User $user, BondOtnr ${strtolower(BondOtnr)}): bool
    {
        return $user->id === ${strtolower(BondOtnr)}->user_id;
    }
}
