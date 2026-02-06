<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\ExchangeRate;

class ExchangeRatePolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, ExchangeRate $exchangeRate): bool
    {
        return $user->id === $exchangeRate->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, ExchangeRate $exchangeRate): bool
    {
        return $user->id === $exchangeRate->user_id;
    }

    public function delete(Profile $user, ExchangeRate $exchangeRate): bool
    {
        return $user->id === $exchangeRate->user_id;
    }

    public function restore(Profile $user, ExchangeRate $exchangeRate): bool
    {
        return $user->id === $exchangeRate->user_id;
    }

    public function forceDelete(Profile $user, ExchangeRate $exchangeRate): bool
    {
        return $user->id === $exchangeRate->user_id;
    }
}
