<?php

namespace App\Policies;

use App\Models\User;
use App\Models\TermDeposit;

class TermDepositPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, TermDeposit $termDeposit): bool
    {
        return $user->id === $termDeposit->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, TermDeposit $termDeposit): bool
    {
        return $user->id === $termDeposit->user_id;
    }

    public function delete(User $user, TermDeposit $termDeposit): bool
    {
        return $user->id === $termDeposit->user_id;
    }

    public function restore(User $user, TermDeposit $termDeposit): bool
    {
        return $user->id === $termDeposit->user_id;
    }

    public function forceDelete(User $user, TermDeposit $termDeposit): bool
    {
        return $user->id === $termDeposit->user_id;
    }
}
