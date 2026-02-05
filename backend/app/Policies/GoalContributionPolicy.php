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

    public function view(User $user, GoalContribution ${strtolower(GoalContribution)}): bool
    {
        return $user->id === ${strtolower(GoalContribution)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, GoalContribution ${strtolower(GoalContribution)}): bool
    {
        return $user->id === ${strtolower(GoalContribution)}->user_id;
    }

    public function delete(User $user, GoalContribution ${strtolower(GoalContribution)}): bool
    {
        return $user->id === ${strtolower(GoalContribution)}->user_id;
    }

    public function restore(User $user, GoalContribution ${strtolower(GoalContribution)}): bool
    {
        return $user->id === ${strtolower(GoalContribution)}->user_id;
    }

    public function forceDelete(User $user, GoalContribution ${strtolower(GoalContribution)}): bool
    {
        return $user->id === ${strtolower(GoalContribution)}->user_id;
    }
}
