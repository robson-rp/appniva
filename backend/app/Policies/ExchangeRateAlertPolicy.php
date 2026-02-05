<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ExchangeRateAlert;

class ExchangeRateAlertPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ExchangeRateAlert $exchangeRateAlert): bool
    {
        return $user->id === $exchangeRateAlert->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ExchangeRateAlert $exchangeRateAlert): bool
    {
        return $user->id === $exchangeRateAlert->user_id;
    }

    public function delete(User $user, ExchangeRateAlert $exchangeRateAlert): bool
    {
        return $user->id === $exchangeRateAlert->user_id;
    }

    public function restore(User $user, ExchangeRateAlert $exchangeRateAlert): bool
    {
        return $user->id === $exchangeRateAlert->user_id;
    }

    public function forceDelete(User $user, ExchangeRateAlert $exchangeRateAlert): bool
    {
        return $user->id === $exchangeRateAlert->user_id;
    }
}
