<?php

namespace App\Policies;

use App\Models\User;
use App\Models\DailyRecommendation;

class DailyRecommendationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, DailyRecommendation ${strtolower(DailyRecommendation)}): bool
    {
        return $user->id === ${strtolower(DailyRecommendation)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, DailyRecommendation ${strtolower(DailyRecommendation)}): bool
    {
        return $user->id === ${strtolower(DailyRecommendation)}->user_id;
    }

    public function delete(User $user, DailyRecommendation ${strtolower(DailyRecommendation)}): bool
    {
        return $user->id === ${strtolower(DailyRecommendation)}->user_id;
    }

    public function restore(User $user, DailyRecommendation ${strtolower(DailyRecommendation)}): bool
    {
        return $user->id === ${strtolower(DailyRecommendation)}->user_id;
    }

    public function forceDelete(User $user, DailyRecommendation ${strtolower(DailyRecommendation)}): bool
    {
        return $user->id === ${strtolower(DailyRecommendation)}->user_id;
    }
}
