<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\Subscription;

class SubscriptionPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, Subscription $subscription): bool
    {
        return $user->id === $subscription->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, Subscription $subscription): bool
    {
        return $user->id === $subscription->user_id;
    }

    public function delete(Profile $user, Subscription $subscription): bool
    {
        return $user->id === $subscription->user_id;
    }

    public function restore(Profile $user, Subscription $subscription): bool
    {
        return $user->id === $subscription->user_id;
    }

    public function forceDelete(Profile $user, Subscription $subscription): bool
    {
        return $user->id === $subscription->user_id;
    }
}
