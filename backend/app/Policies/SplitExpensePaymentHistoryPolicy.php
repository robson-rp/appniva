<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\SplitExpensePaymentHistory;

class SplitExpensePaymentHistoryPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, SplitExpensePaymentHistory $splitExpensePaymentHistory): bool
    {
        return $user->id === $splitExpensePaymentHistory->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, SplitExpensePaymentHistory $splitExpensePaymentHistory): bool
    {
        return $user->id === $splitExpensePaymentHistory->user_id;
    }

    public function delete(Profile $user, SplitExpensePaymentHistory $splitExpensePaymentHistory): bool
    {
        return $user->id === $splitExpensePaymentHistory->user_id;
    }

    public function restore(Profile $user, SplitExpensePaymentHistory $splitExpensePaymentHistory): bool
    {
        return $user->id === $splitExpensePaymentHistory->user_id;
    }

    public function forceDelete(Profile $user, SplitExpensePaymentHistory $splitExpensePaymentHistory): bool
    {
        return $user->id === $splitExpensePaymentHistory->user_id;
    }
}
