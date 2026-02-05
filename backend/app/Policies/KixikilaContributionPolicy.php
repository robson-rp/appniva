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

    public function view(User $user, KixikilaContribution $kixikilaContribution): bool
    {
        return $user->id === $kixikilaContribution->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, KixikilaContribution $kixikilaContribution): bool
    {
        return $user->id === $kixikilaContribution->user_id;
    }

    public function delete(User $user, KixikilaContribution $kixikilaContribution): bool
    {
        return $user->id === $kixikilaContribution->user_id;
    }

    public function restore(User $user, KixikilaContribution $kixikilaContribution): bool
    {
        return $user->id === $kixikilaContribution->user_id;
    }

    public function forceDelete(User $user, KixikilaContribution $kixikilaContribution): bool
    {
        return $user->id === $kixikilaContribution->user_id;
    }
}
