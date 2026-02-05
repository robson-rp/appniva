<?php

namespace App\Policies;

use App\Models\User;
use App\Models\BankReconciliation;

class BankReconciliationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, BankReconciliation ${strtolower(BankReconciliation)}): bool
    {
        return $user->id === ${strtolower(BankReconciliation)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, BankReconciliation ${strtolower(BankReconciliation)}): bool
    {
        return $user->id === ${strtolower(BankReconciliation)}->user_id;
    }

    public function delete(User $user, BankReconciliation ${strtolower(BankReconciliation)}): bool
    {
        return $user->id === ${strtolower(BankReconciliation)}->user_id;
    }

    public function restore(User $user, BankReconciliation ${strtolower(BankReconciliation)}): bool
    {
        return $user->id === ${strtolower(BankReconciliation)}->user_id;
    }

    public function forceDelete(User $user, BankReconciliation ${strtolower(BankReconciliation)}): bool
    {
        return $user->id === ${strtolower(BankReconciliation)}->user_id;
    }
}
