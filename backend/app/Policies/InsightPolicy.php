<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Insight;

class InsightPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Insight ${strtolower(Insight)}): bool
    {
        return $user->id === ${strtolower(Insight)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Insight ${strtolower(Insight)}): bool
    {
        return $user->id === ${strtolower(Insight)}->user_id;
    }

    public function delete(User $user, Insight ${strtolower(Insight)}): bool
    {
        return $user->id === ${strtolower(Insight)}->user_id;
    }

    public function restore(User $user, Insight ${strtolower(Insight)}): bool
    {
        return $user->id === ${strtolower(Insight)}->user_id;
    }

    public function forceDelete(User $user, Insight ${strtolower(Insight)}): bool
    {
        return $user->id === ${strtolower(Insight)}->user_id;
    }
}
