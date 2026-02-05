<?php

namespace App\Policies;

use App\Models\User;
use App\Models\SplitExpense;

class SplitExpensePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SplitExpense ${strtolower(SplitExpense)}): bool
    {
        return $user->id === ${strtolower(SplitExpense)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SplitExpense ${strtolower(SplitExpense)}): bool
    {
        return $user->id === ${strtolower(SplitExpense)}->user_id;
    }

    public function delete(User $user, SplitExpense ${strtolower(SplitExpense)}): bool
    {
        return $user->id === ${strtolower(SplitExpense)}->user_id;
    }

    public function restore(User $user, SplitExpense ${strtolower(SplitExpense)}): bool
    {
        return $user->id === ${strtolower(SplitExpense)}->user_id;
    }

    public function forceDelete(User $user, SplitExpense ${strtolower(SplitExpense)}): bool
    {
        return $user->id === ${strtolower(SplitExpense)}->user_id;
    }
}
