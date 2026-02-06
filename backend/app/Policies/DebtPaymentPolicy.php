<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\DebtPayment;

class DebtPaymentPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, DebtPayment $debtPayment): bool
    {
        return $user->id === $debtPayment->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, DebtPayment $debtPayment): bool
    {
        return $user->id === $debtPayment->user_id;
    }

    public function delete(Profile $user, DebtPayment $debtPayment): bool
    {
        return $user->id === $debtPayment->user_id;
    }

    public function restore(Profile $user, DebtPayment $debtPayment): bool
    {
        return $user->id === $debtPayment->user_id;
    }

    public function forceDelete(Profile $user, DebtPayment $debtPayment): bool
    {
        return $user->id === $debtPayment->user_id;
    }
}
