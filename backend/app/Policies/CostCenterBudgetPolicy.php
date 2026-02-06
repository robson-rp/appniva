<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\CostCenterBudget;

class CostCenterBudgetPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, CostCenterBudget $costCenterBudget): bool
    {
        return $user->id === $costCenterBudget->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, CostCenterBudget $costCenterBudget): bool
    {
        return $user->id === $costCenterBudget->user_id;
    }

    public function delete(Profile $user, CostCenterBudget $costCenterBudget): bool
    {
        return $user->id === $costCenterBudget->user_id;
    }

    public function restore(Profile $user, CostCenterBudget $costCenterBudget): bool
    {
        return $user->id === $costCenterBudget->user_id;
    }

    public function forceDelete(Profile $user, CostCenterBudget $costCenterBudget): bool
    {
        return $user->id === $costCenterBudget->user_id;
    }
}
