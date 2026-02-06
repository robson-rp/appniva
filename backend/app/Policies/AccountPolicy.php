<?php

namespace App\Policies;

use App\Models\{Account};
use App\Models\Profile;

class AccountPolicy
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
    public function view(Profile $user, Account $account): bool
    {
        return $user->id === $account->user_id;
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
    public function update(Profile $user, Account $account): bool
    {
        return $user->id === $account->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Profile $user, Account $account): bool
    {
        return $user->id === $account->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Profile $user, Account $account): bool
    {
        return $user->id === $account->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Profile $user, Account $account): bool
    {
        return $user->id === $account->user_id;
    }
}