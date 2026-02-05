<?php

namespace App\Policies;

use App\Models\User;
use App\Models\GoalContribution;

class GoalContributionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, GoalContribution $goalContribution): bool
    {
        return $user->id === $goalContribution->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, GoalContribution $goalContribution): bool
    {
        return $user->id === $goalContribution->user_id;
    }

    public function delete(User $user, GoalContribution $goalContribution): bool
    {
        return $user->id === $goalContribution->user_id;
    }

    public function restore(User $user, GoalContribution $goalContribution): bool
    {
        return $user->id === $goalContribution->user_id;
    }

    public function forceDelete(User $user, GoalContribution $goalContribution): bool
    {
        return $user->id === $goalContribution->user_id;
    }
}
