<?php

namespace App\Policies;

use App\Models\User;
use App\Models\KixikilaMembers;

class KixikilaMembersPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, KixikilaMembers $kixikilaMembers): bool
    {
        return $user->id === $kixikilaMembers->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, KixikilaMembers $kixikilaMembers): bool
    {
        return $user->id === $kixikilaMembers->user_id;
    }

    public function delete(User $user, KixikilaMembers $kixikilaMembers): bool
    {
        return $user->id === $kixikilaMembers->user_id;
    }

    public function restore(User $user, KixikilaMembers $kixikilaMembers): bool
    {
        return $user->id === $kixikilaMembers->user_id;
    }

    public function forceDelete(User $user, KixikilaMembers $kixikilaMembers): bool
    {
        return $user->id === $kixikilaMembers->user_id;
    }
}
