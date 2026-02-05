<?php

namespace App\Policies;

use App\Models\User;
use App\Models\SchoolFeeTemplate;

class SchoolFeeTemplatePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SchoolFeeTemplate $schoolFeeTemplate): bool
    {
        return $user->id === $schoolFeeTemplate->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SchoolFeeTemplate $schoolFeeTemplate): bool
    {
        return $user->id === $schoolFeeTemplate->user_id;
    }

    public function delete(User $user, SchoolFeeTemplate $schoolFeeTemplate): bool
    {
        return $user->id === $schoolFeeTemplate->user_id;
    }

    public function restore(User $user, SchoolFeeTemplate $schoolFeeTemplate): bool
    {
        return $user->id === $schoolFeeTemplate->user_id;
    }

    public function forceDelete(User $user, SchoolFeeTemplate $schoolFeeTemplate): bool
    {
        return $user->id === $schoolFeeTemplate->user_id;
    }
}
