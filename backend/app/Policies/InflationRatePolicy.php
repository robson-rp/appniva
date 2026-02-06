<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\InflationRate;

class InflationRatePolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, InflationRate $inflationRate): bool
    {
        return $user->id === $inflationRate->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, InflationRate $inflationRate): bool
    {
        return $user->id === $inflationRate->user_id;
    }

    public function delete(Profile $user, InflationRate $inflationRate): bool
    {
        return $user->id === $inflationRate->user_id;
    }

    public function restore(Profile $user, InflationRate $inflationRate): bool
    {
        return $user->id === $inflationRate->user_id;
    }

    public function forceDelete(Profile $user, InflationRate $inflationRate): bool
    {
        return $user->id === $inflationRate->user_id;
    }
}
