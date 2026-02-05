<?php

namespace App\Policies;

use App\Models\User;
use App\Models\KixikilaContribution;

class KixikilaContributionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, KixikilaContribution ${strtolower(KixikilaContribution)}): bool
    {
        return $user->id === ${strtolower(KixikilaContribution)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, KixikilaContribution ${strtolower(KixikilaContribution)}): bool
    {
        return $user->id === ${strtolower(KixikilaContribution)}->user_id;
    }

    public function delete(User $user, KixikilaContribution ${strtolower(KixikilaContribution)}): bool
    {
        return $user->id === ${strtolower(KixikilaContribution)}->user_id;
    }

    public function restore(User $user, KixikilaContribution ${strtolower(KixikilaContribution)}): bool
    {
        return $user->id === ${strtolower(KixikilaContribution)}->user_id;
    }

    public function forceDelete(User $user, KixikilaContribution ${strtolower(KixikilaContribution)}): bool
    {
        return $user->id === ${strtolower(KixikilaContribution)}->user_id;
    }
}
