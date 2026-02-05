<?php

namespace App\Policies;

use App\Models\User;
use App\Models\SplitExpensePaymentHistory;

class SplitExpensePaymentHistoryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SplitExpensePaymentHistory $splitExpensePaymentHistory): bool
    {
        return $user->id === $splitExpensePaymentHistory->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SplitExpensePaymentHistory $splitExpensePaymentHistory): bool
    {
        return $user->id === $splitExpensePaymentHistory->user_id;
    }

    public function delete(User $user, SplitExpensePaymentHistory $splitExpensePaymentHistory): bool
    {
        return $user->id === $splitExpensePaymentHistory->user_id;
    }

    public function restore(User $user, SplitExpensePaymentHistory $splitExpensePaymentHistory): bool
    {
        return $user->id === $splitExpensePaymentHistory->user_id;
    }

    public function forceDelete(User $user, SplitExpensePaymentHistory $splitExpensePaymentHistory): bool
    {
        return $user->id === $splitExpensePaymentHistory->user_id;
    }
}
