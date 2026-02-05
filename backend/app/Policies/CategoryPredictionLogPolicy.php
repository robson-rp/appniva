<?php

namespace App\Policies;

use App\Models\User;
use App\Models\CategoryPredictionLog;

class CategoryPredictionLogPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CategoryPredictionLog $categoryPredictionLog): bool
    {
        return $user->id === $categoryPredictionLog->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, CategoryPredictionLog $categoryPredictionLog): bool
    {
        return $user->id === $categoryPredictionLog->user_id;
    }

    public function delete(User $user, CategoryPredictionLog $categoryPredictionLog): bool
    {
        return $user->id === $categoryPredictionLog->user_id;
    }

    public function restore(User $user, CategoryPredictionLog $categoryPredictionLog): bool
    {
        return $user->id === $categoryPredictionLog->user_id;
    }

    public function forceDelete(User $user, CategoryPredictionLog $categoryPredictionLog): bool
    {
        return $user->id === $categoryPredictionLog->user_id;
    }
}
