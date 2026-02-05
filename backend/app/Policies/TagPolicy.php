<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Tag;

class TagPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Tag ${strtolower(Tag)}): bool
    {
        return $user->id === ${strtolower(Tag)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Tag ${strtolower(Tag)}): bool
    {
        return $user->id === ${strtolower(Tag)}->user_id;
    }

    public function delete(User $user, Tag ${strtolower(Tag)}): bool
    {
        return $user->id === ${strtolower(Tag)}->user_id;
    }

    public function restore(User $user, Tag ${strtolower(Tag)}): bool
    {
        return $user->id === ${strtolower(Tag)}->user_id;
    }

    public function forceDelete(User $user, Tag ${strtolower(Tag)}): bool
    {
        return $user->id === ${strtolower(Tag)}->user_id;
    }
}
