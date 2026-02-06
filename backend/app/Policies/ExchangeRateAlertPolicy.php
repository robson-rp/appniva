<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\ExchangeRateAlert;

class ExchangeRateAlertPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, ExchangeRateAlert $exchangeRateAlert): bool
    {
        return $user->id === $exchangeRateAlert->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, ExchangeRateAlert $exchangeRateAlert): bool
    {
        return $user->id === $exchangeRateAlert->user_id;
    }

    public function delete(Profile $user, ExchangeRateAlert $exchangeRateAlert): bool
    {
        return $user->id === $exchangeRateAlert->user_id;
    }

    public function restore(Profile $user, ExchangeRateAlert $exchangeRateAlert): bool
    {
        return $user->id === $exchangeRateAlert->user_id;
    }

    public function forceDelete(Profile $user, ExchangeRateAlert $exchangeRateAlert): bool
    {
        return $user->id === $exchangeRateAlert->user_id;
    }
}
