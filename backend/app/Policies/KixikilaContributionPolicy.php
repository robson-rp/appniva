<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\KixikilaContribution;

class KixikilaContributionPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, KixikilaContribution $kixikilaContribution): bool
    {
        return $user->id === $kixikilaContribution->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, KixikilaContribution $kixikilaContribution): bool
    {
        return $user->id === $kixikilaContribution->user_id;
    }

    public function delete(Profile $user, KixikilaContribution $kixikilaContribution): bool
    {
        return $user->id === $kixikilaContribution->user_id;
    }

    public function restore(Profile $user, KixikilaContribution $kixikilaContribution): bool
    {
        return $user->id === $kixikilaContribution->user_id;
    }

    public function forceDelete(Profile $user, KixikilaContribution $kixikilaContribution): bool
    {
        return $user->id === $kixikilaContribution->user_id;
    }
}
