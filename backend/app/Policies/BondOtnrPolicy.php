<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\BondOtnr;

class BondOtnrPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, BondOtnr $bondOtnr): bool
    {
        return $user->id === $bondOtnr->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, BondOtnr $bondOtnr): bool
    {
        return $user->id === $bondOtnr->user_id;
    }

    public function delete(Profile $user, BondOtnr $bondOtnr): bool
    {
        return $user->id === $bondOtnr->user_id;
    }

    public function restore(Profile $user, BondOtnr $bondOtnr): bool
    {
        return $user->id === $bondOtnr->user_id;
    }

    public function forceDelete(Profile $user, BondOtnr $bondOtnr): bool
    {
        return $user->id === $bondOtnr->user_id;
    }
}
