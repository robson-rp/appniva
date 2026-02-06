<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\TermDeposit;

class TermDepositPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, TermDeposit $termDeposit): bool
    {
        return $user->id === $termDeposit->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, TermDeposit $termDeposit): bool
    {
        return $user->id === $termDeposit->user_id;
    }

    public function delete(Profile $user, TermDeposit $termDeposit): bool
    {
        return $user->id === $termDeposit->user_id;
    }

    public function restore(Profile $user, TermDeposit $termDeposit): bool
    {
        return $user->id === $termDeposit->user_id;
    }

    public function forceDelete(Profile $user, TermDeposit $termDeposit): bool
    {
        return $user->id === $termDeposit->user_id;
    }
}
