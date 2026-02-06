<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\SchoolFeeTemplate;

class SchoolFeeTemplatePolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, SchoolFeeTemplate $schoolFeeTemplate): bool
    {
        return $user->id === $schoolFeeTemplate->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, SchoolFeeTemplate $schoolFeeTemplate): bool
    {
        return $user->id === $schoolFeeTemplate->user_id;
    }

    public function delete(Profile $user, SchoolFeeTemplate $schoolFeeTemplate): bool
    {
        return $user->id === $schoolFeeTemplate->user_id;
    }

    public function restore(Profile $user, SchoolFeeTemplate $schoolFeeTemplate): bool
    {
        return $user->id === $schoolFeeTemplate->user_id;
    }

    public function forceDelete(Profile $user, SchoolFeeTemplate $schoolFeeTemplate): bool
    {
        return $user->id === $schoolFeeTemplate->user_id;
    }
}
