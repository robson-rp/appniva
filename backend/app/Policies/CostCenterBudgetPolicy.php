<?php

namespace App\Policies;

use App\Models\User;
use App\Models\CostCenterBudget;

class CostCenterBudgetPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CostCenterBudget $costCenterBudget): bool
    {
        return $user->id === $costCenterBudget->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, CostCenterBudget $costCenterBudget): bool
    {
        return $user->id === $costCenterBudget->user_id;
    }

    public function delete(User $user, CostCenterBudget $costCenterBudget): bool
    {
        return $user->id === $costCenterBudget->user_id;
    }

    public function restore(User $user, CostCenterBudget $costCenterBudget): bool
    {
        return $user->id === $costCenterBudget->user_id;
    }

    public function forceDelete(User $user, CostCenterBudget $costCenterBudget): bool
    {
        return $user->id === $costCenterBudget->user_id;
    }
}
