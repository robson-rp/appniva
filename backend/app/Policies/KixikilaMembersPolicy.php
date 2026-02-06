<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\KixikilaMembers;

class KixikilaMembersPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, KixikilaMembers $kixikilaMembers): bool
    {
        return $user->id === $kixikilaMembers->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, KixikilaMembers $kixikilaMembers): bool
    {
        return $user->id === $kixikilaMembers->user_id;
    }

    public function delete(Profile $user, KixikilaMembers $kixikilaMembers): bool
    {
        return $user->id === $kixikilaMembers->user_id;
    }

    public function restore(Profile $user, KixikilaMembers $kixikilaMembers): bool
    {
        return $user->id === $kixikilaMembers->user_id;
    }

    public function forceDelete(Profile $user, KixikilaMembers $kixikilaMembers): bool
    {
        return $user->id === $kixikilaMembers->user_id;
    }
}
