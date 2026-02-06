<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\BankReconciliation;

class BankReconciliationPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, BankReconciliation $bankReconciliation): bool
    {
        return $user->id === $bankReconciliation->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, BankReconciliation $bankReconciliation): bool
    {
        return $user->id === $bankReconciliation->user_id;
    }

    public function delete(Profile $user, BankReconciliation $bankReconciliation): bool
    {
        return $user->id === $bankReconciliation->user_id;
    }

    public function restore(Profile $user, BankReconciliation $bankReconciliation): bool
    {
        return $user->id === $bankReconciliation->user_id;
    }

    public function forceDelete(Profile $user, BankReconciliation $bankReconciliation): bool
    {
        return $user->id === $bankReconciliation->user_id;
    }
}
