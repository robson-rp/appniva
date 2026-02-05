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

    public function view(User $user, DailyRecommendation $dailyRecommendation): bool
    {
        return $user->id === $dailyRecommendation->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, DailyRecommendation $dailyRecommendation): bool
    {
        return $user->id === $dailyRecommendation->user_id;
    }

    public function delete(User $user, DailyRecommendation $dailyRecommendation): bool
    {
        return $user->id === $dailyRecommendation->user_id;
    }

    public function restore(User $user, DailyRecommendation $dailyRecommendation): bool
    {
        return $user->id === $dailyRecommendation->user_id;
    }

    public function forceDelete(User $user, DailyRecommendation $dailyRecommendation): bool
    {
        return $user->id === $dailyRecommendation->user_id;
    }
}
