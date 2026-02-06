<?php

namespace App\Policies;

use App\Models\{Debt};
use App\Models\Profile;

class DebtPolicy
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
    public function view(Profile $user, Debt $debt): bool
    {
        return $user->id === $debt->user_id;
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
    public function update(Profile $user, Debt $debt): bool
    {
        return $user->id === $debt->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Profile $user, Debt $debt): bool
    {
        return $user->id === $debt->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Profile $user, Debt $debt): bool
    {
        return $user->id === $debt->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Profile $user, Debt $debt): bool
    {
        return $user->id === $debt->user_id;
    }
}