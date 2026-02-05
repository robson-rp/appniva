<?php

namespace App\Policies;

use App\Models\User;
use App\Models\SchoolFee;

class SchoolFeePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SchoolFee ${strtolower(SchoolFee)}): bool
    {
        return $user->id === ${strtolower(SchoolFee)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SchoolFee ${strtolower(SchoolFee)}): bool
    {
        return $user->id === ${strtolower(SchoolFee)}->user_id;
    }

    public function delete(User $user, SchoolFee ${strtolower(SchoolFee)}): bool
    {
        return $user->id === ${strtolower(SchoolFee)}->user_id;
    }

    public function restore(User $user, SchoolFee ${strtolower(SchoolFee)}): bool
    {
        return $user->id === ${strtolower(SchoolFee)}->user_id;
    }

    public function forceDelete(User $user, SchoolFee ${strtolower(SchoolFee)}): bool
    {
        return $user->id === ${strtolower(SchoolFee)}->user_id;
    }
}
