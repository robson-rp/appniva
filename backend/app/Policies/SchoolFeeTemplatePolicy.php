<?php

namespace App\Policies;

use App\Models\User;
use App\Models\SchoolFeeTemplate;

class SchoolFeeTemplatePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SchoolFeeTemplate ${strtolower(SchoolFeeTemplate)}): bool
    {
        return $user->id === ${strtolower(SchoolFeeTemplate)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SchoolFeeTemplate ${strtolower(SchoolFeeTemplate)}): bool
    {
        return $user->id === ${strtolower(SchoolFeeTemplate)}->user_id;
    }

    public function delete(User $user, SchoolFeeTemplate ${strtolower(SchoolFeeTemplate)}): bool
    {
        return $user->id === ${strtolower(SchoolFeeTemplate)}->user_id;
    }

    public function restore(User $user, SchoolFeeTemplate ${strtolower(SchoolFeeTemplate)}): bool
    {
        return $user->id === ${strtolower(SchoolFeeTemplate)}->user_id;
    }

    public function forceDelete(User $user, SchoolFeeTemplate ${strtolower(SchoolFeeTemplate)}): bool
    {
        return $user->id === ${strtolower(SchoolFeeTemplate)}->user_id;
    }
}
