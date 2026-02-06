<?php

namespace App\Policies;

use App\Models\{Budget};
use App\Models\Profile;

class BudgetPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Profile $user, Budget $budget): bool
    {
        return $user->id === $budget->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Profile $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Profile $user, Budget $budget): bool
    {
        return $user->id === $budget->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Profile $user, Budget $budget): bool
    {
        return $user->id === $budget->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Profile $user, Budget $budget): bool
    {
        return $user->id === $budget->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Profile $user, Budget $budget): bool
    {
        return $user->id === $budget->user_id;
    }
}