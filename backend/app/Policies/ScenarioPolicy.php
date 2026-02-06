<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\Scenario;

class ScenarioPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, Scenario $scenario): bool
    {
        return $user->id === $scenario->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, Scenario $scenario): bool
    {
        return $user->id === $scenario->user_id;
    }

    public function delete(Profile $user, Scenario $scenario): bool
    {
        return $user->id === $scenario->user_id;
    }

    public function restore(Profile $user, Scenario $scenario): bool
    {
        return $user->id === $scenario->user_id;
    }

    public function forceDelete(Profile $user, Scenario $scenario): bool
    {
        return $user->id === $scenario->user_id;
    }
}
