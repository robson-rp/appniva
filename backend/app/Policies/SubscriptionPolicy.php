<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Subscription;

class SubscriptionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Subscription ${strtolower(Subscription)}): bool
    {
        return $user->id === ${strtolower(Subscription)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Subscription ${strtolower(Subscription)}): bool
    {
        return $user->id === ${strtolower(Subscription)}->user_id;
    }

    public function delete(User $user, Subscription ${strtolower(Subscription)}): bool
    {
        return $user->id === ${strtolower(Subscription)}->user_id;
    }

    public function restore(User $user, Subscription ${strtolower(Subscription)}): bool
    {
        return $user->id === ${strtolower(Subscription)}->user_id;
    }

    public function forceDelete(User $user, Subscription ${strtolower(Subscription)}): bool
    {
        return $user->id === ${strtolower(Subscription)}->user_id;
    }
}
