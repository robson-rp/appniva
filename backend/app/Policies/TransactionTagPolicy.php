<?php

namespace App\Policies;

use App\Models\User;
use App\Models\TransactionTag;

class TransactionTagPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, TransactionTag ${strtolower(TransactionTag)}): bool
    {
        return $user->id === ${strtolower(TransactionTag)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, TransactionTag ${strtolower(TransactionTag)}): bool
    {
        return $user->id === ${strtolower(TransactionTag)}->user_id;
    }

    public function delete(User $user, TransactionTag ${strtolower(TransactionTag)}): bool
    {
        return $user->id === ${strtolower(TransactionTag)}->user_id;
    }

    public function restore(User $user, TransactionTag ${strtolower(TransactionTag)}): bool
    {
        return $user->id === ${strtolower(TransactionTag)}->user_id;
    }

    public function forceDelete(User $user, TransactionTag ${strtolower(TransactionTag)}): bool
    {
        return $user->id === ${strtolower(TransactionTag)}->user_id;
    }
}
