<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\Tag;

class TagPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, Tag $tag): bool
    {
        return $user->id === $tag->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, Tag $tag): bool
    {
        return $user->id === $tag->user_id;
    }

    public function delete(Profile $user, Tag $tag): bool
    {
        return $user->id === $tag->user_id;
    }

    public function restore(Profile $user, Tag $tag): bool
    {
        return $user->id === $tag->user_id;
    }

    public function forceDelete(Profile $user, Tag $tag): bool
    {
        return $user->id === $tag->user_id;
    }
}
