<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Scenario;

class ScenarioPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Scenario $scenario): bool
    {
        return $user->id === $scenario->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Scenario $scenario): bool
    {
        return $user->id === $scenario->user_id;
    }

    public function delete(User $user, Scenario $scenario): bool
    {
        return $user->id === $scenario->user_id;
    }

    public function restore(User $user, Scenario $scenario): bool
    {
        return $user->id === $scenario->user_id;
    }

    public function forceDelete(User $user, Scenario $scenario): bool
    {
        return $user->id === $scenario->user_id;
    }
}
