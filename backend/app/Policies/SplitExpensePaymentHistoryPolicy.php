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

    public function view(User $user, SplitExpensePaymentHistory ${strtolower(SplitExpensePaymentHistory)}): bool
    {
        return $user->id === ${strtolower(SplitExpensePaymentHistory)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SplitExpensePaymentHistory ${strtolower(SplitExpensePaymentHistory)}): bool
    {
        return $user->id === ${strtolower(SplitExpensePaymentHistory)}->user_id;
    }

    public function delete(User $user, SplitExpensePaymentHistory ${strtolower(SplitExpensePaymentHistory)}): bool
    {
        return $user->id === ${strtolower(SplitExpensePaymentHistory)}->user_id;
    }

    public function restore(User $user, SplitExpensePaymentHistory ${strtolower(SplitExpensePaymentHistory)}): bool
    {
        return $user->id === ${strtolower(SplitExpensePaymentHistory)}->user_id;
    }

    public function forceDelete(User $user, SplitExpensePaymentHistory ${strtolower(SplitExpensePaymentHistory)}): bool
    {
        return $user->id === ${strtolower(SplitExpensePaymentHistory)}->user_id;
    }
}
