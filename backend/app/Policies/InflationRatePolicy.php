<?php

namespace App\Policies;

use App\Models\User;
use App\Models\InflationRate;

class InflationRatePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, InflationRate $inflationRate): bool
    {
        return $user->id === $inflationRate->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, InflationRate $inflationRate): bool
    {
        return $user->id === $inflationRate->user_id;
    }

    public function delete(User $user, InflationRate $inflationRate): bool
    {
        return $user->id === $inflationRate->user_id;
    }

    public function restore(User $user, InflationRate $inflationRate): bool
    {
        return $user->id === $inflationRate->user_id;
    }

    public function forceDelete(User $user, InflationRate $inflationRate): bool
    {
        return $user->id === $inflationRate->user_id;
    }
}
