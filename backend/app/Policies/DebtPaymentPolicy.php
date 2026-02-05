<?php

namespace App\Policies;

use App\Models\User;
use App\Models\DebtPayment;

class DebtPaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, DebtPayment $debtPayment): bool
    {
        return $user->id === $debtPayment->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, DebtPayment $debtPayment): bool
    {
        return $user->id === $debtPayment->user_id;
    }

    public function delete(User $user, DebtPayment $debtPayment): bool
    {
        return $user->id === $debtPayment->user_id;
    }

    public function restore(User $user, DebtPayment $debtPayment): bool
    {
        return $user->id === $debtPayment->user_id;
    }

    public function forceDelete(User $user, DebtPayment $debtPayment): bool
    {
        return $user->id === $debtPayment->user_id;
    }
}
