<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\Kixikila;

class KixikilaPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, Kixikila $kixikila): bool
    {
        return $user->id === $kixikila->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, Kixikila $kixikila): bool
    {
        return $user->id === $kixikila->user_id;
    }

    public function delete(Profile $user, Kixikila $kixikila): bool
    {
        return $user->id === $kixikila->user_id;
    }

    public function restore(Profile $user, Kixikila $kixikila): bool
    {
        return $user->id === $kixikila->user_id;
    }

    public function forceDelete(Profile $user, Kixikila $kixikila): bool
    {
        return $user->id === $kixikila->user_id;
    }
}
