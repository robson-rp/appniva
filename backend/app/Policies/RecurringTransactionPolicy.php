<?php

namespace App\Policies;

use App\Models\User;
use App\Models\RecurringTransaction;

class RecurringTransactionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, RecurringTransaction ${strtolower(RecurringTransaction)}): bool
    {
        return $user->id === ${strtolower(RecurringTransaction)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, RecurringTransaction ${strtolower(RecurringTransaction)}): bool
    {
        return $user->id === ${strtolower(RecurringTransaction)}->user_id;
    }

    public function delete(User $user, RecurringTransaction ${strtolower(RecurringTransaction)}): bool
    {
        return $user->id === ${strtolower(RecurringTransaction)}->user_id;
    }

    public function restore(User $user, RecurringTransaction ${strtolower(RecurringTransaction)}): bool
    {
        return $user->id === ${strtolower(RecurringTransaction)}->user_id;
    }

    public function forceDelete(User $user, RecurringTransaction ${strtolower(RecurringTransaction)}): bool
    {
        return $user->id === ${strtolower(RecurringTransaction)}->user_id;
    }
}
