<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\GoalContribution;

class GoalContributionPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, GoalContribution $goalContribution): bool
    {
        return $user->id === $goalContribution->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, GoalContribution $goalContribution): bool
    {
        return $user->id === $goalContribution->user_id;
    }

    public function delete(Profile $user, GoalContribution $goalContribution): bool
    {
        return $user->id === $goalContribution->user_id;
    }

    public function restore(Profile $user, GoalContribution $goalContribution): bool
    {
        return $user->id === $goalContribution->user_id;
    }

    public function forceDelete(Profile $user, GoalContribution $goalContribution): bool
    {
        return $user->id === $goalContribution->user_id;
    }
}
