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

    public function view(User $user, ExchangeRate $exchangeRate): bool
    {
        return $user->id === $exchangeRate->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ExchangeRate $exchangeRate): bool
    {
        return $user->id === $exchangeRate->user_id;
    }

    public function delete(User $user, ExchangeRate $exchangeRate): bool
    {
        return $user->id === $exchangeRate->user_id;
    }

    public function restore(User $user, ExchangeRate $exchangeRate): bool
    {
        return $user->id === $exchangeRate->user_id;
    }

    public function forceDelete(User $user, ExchangeRate $exchangeRate): bool
    {
        return $user->id === $exchangeRate->user_id;
    }
}
