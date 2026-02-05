<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ExchangeRate;

class ExchangeRatePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ExchangeRate ${strtolower(ExchangeRate)}): bool
    {
        return $user->id === ${strtolower(ExchangeRate)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ExchangeRate ${strtolower(ExchangeRate)}): bool
    {
        return $user->id === ${strtolower(ExchangeRate)}->user_id;
    }

    public function delete(User $user, ExchangeRate ${strtolower(ExchangeRate)}): bool
    {
        return $user->id === ${strtolower(ExchangeRate)}->user_id;
    }

    public function restore(User $user, ExchangeRate ${strtolower(ExchangeRate)}): bool
    {
        return $user->id === ${strtolower(ExchangeRate)}->user_id;
    }

    public function forceDelete(User $user, ExchangeRate ${strtolower(ExchangeRate)}): bool
    {
        return $user->id === ${strtolower(ExchangeRate)}->user_id;
    }
}
