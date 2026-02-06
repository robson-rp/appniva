<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\RecurringTransaction;

class RecurringTransactionPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, RecurringTransaction $recurringTransaction): bool
    {
        return $user->id === $recurringTransaction->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, RecurringTransaction $recurringTransaction): bool
    {
        return $user->id === $recurringTransaction->user_id;
    }

    public function delete(Profile $user, RecurringTransaction $recurringTransaction): bool
    {
        return $user->id === $recurringTransaction->user_id;
    }

    public function restore(Profile $user, RecurringTransaction $recurringTransaction): bool
    {
        return $user->id === $recurringTransaction->user_id;
    }

    public function forceDelete(Profile $user, RecurringTransaction $recurringTransaction): bool
    {
        return $user->id === $recurringTransaction->user_id;
    }
}
