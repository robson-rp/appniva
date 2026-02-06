<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\TransactionTag;

class TransactionTagPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, TransactionTag $transactionTag): bool
    {
        return $user->id === $transactionTag->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, TransactionTag $transactionTag): bool
    {
        return $user->id === $transactionTag->user_id;
    }

    public function delete(Profile $user, TransactionTag $transactionTag): bool
    {
        return $user->id === $transactionTag->user_id;
    }

    public function restore(Profile $user, TransactionTag $transactionTag): bool
    {
        return $user->id === $transactionTag->user_id;
    }

    public function forceDelete(Profile $user, TransactionTag $transactionTag): bool
    {
        return $user->id === $transactionTag->user_id;
    }
}
