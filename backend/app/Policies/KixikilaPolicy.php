<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Kixikila;

class KixikilaPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Kixikila $kixikila): bool
    {
        return $user->id === $kixikila->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Kixikila $kixikila): bool
    {
        return $user->id === $kixikila->user_id;
    }

    public function delete(User $user, Kixikila $kixikila): bool
    {
        return $user->id === $kixikila->user_id;
    }

    public function restore(User $user, Kixikila $kixikila): bool
    {
        return $user->id === $kixikila->user_id;
    }

    public function forceDelete(User $user, Kixikila $kixikila): bool
    {
        return $user->id === $kixikila->user_id;
    }
}
