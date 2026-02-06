<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\SecurityLog;

class SecurityLogPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, SecurityLog $securityLog): bool
    {
        return $user->id === $securityLog->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, SecurityLog $securityLog): bool
    {
        return $user->id === $securityLog->user_id;
    }

    public function delete(Profile $user, SecurityLog $securityLog): bool
    {
        return $user->id === $securityLog->user_id;
    }

    public function restore(Profile $user, SecurityLog $securityLog): bool
    {
        return $user->id === $securityLog->user_id;
    }

    public function forceDelete(Profile $user, SecurityLog $securityLog): bool
    {
        return $user->id === $securityLog->user_id;
    }
}
