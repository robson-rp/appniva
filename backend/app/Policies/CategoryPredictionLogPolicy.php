<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\CategoryPredictionLog;

class CategoryPredictionLogPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, CategoryPredictionLog $categoryPredictionLog): bool
    {
        return $user->id === $categoryPredictionLog->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, CategoryPredictionLog $categoryPredictionLog): bool
    {
        return $user->id === $categoryPredictionLog->user_id;
    }

    public function delete(Profile $user, CategoryPredictionLog $categoryPredictionLog): bool
    {
        return $user->id === $categoryPredictionLog->user_id;
    }

    public function restore(Profile $user, CategoryPredictionLog $categoryPredictionLog): bool
    {
        return $user->id === $categoryPredictionLog->user_id;
    }

    public function forceDelete(Profile $user, CategoryPredictionLog $categoryPredictionLog): bool
    {
        return $user->id === $categoryPredictionLog->user_id;
    }
}
