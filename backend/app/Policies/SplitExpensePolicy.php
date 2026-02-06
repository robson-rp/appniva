<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\SplitExpense;

class SplitExpensePolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, SplitExpense $splitExpense): bool
    {
        return $user->id === $splitExpense->creator_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, SplitExpense $splitExpense): bool
    {
        return $user->id === $splitExpense->creator_id;
    }

    public function delete(Profile $user, SplitExpense $splitExpense): bool
    {
        return $user->id === $splitExpense->creator_id;
    }

    public function restore(Profile $user, SplitExpense $splitExpense): bool
    {
        return $user->id === $splitExpense->creator_id;
    }

    public function forceDelete(Profile $user, SplitExpense $splitExpense): bool
    {
        return $user->id === $splitExpense->creator_id;
    }
}
