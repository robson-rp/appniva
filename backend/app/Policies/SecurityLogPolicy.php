<?php

namespace App\Policies;

use App\Models\User;
use App\Models\SecurityLog;

class SecurityLogPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SecurityLog $securityLog): bool
    {
        return $user->id === $securityLog->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SecurityLog $securityLog): bool
    {
        return $user->id === $securityLog->user_id;
    }

    public function delete(User $user, SecurityLog $securityLog): bool
    {
        return $user->id === $securityLog->user_id;
    }

    public function restore(User $user, SecurityLog $securityLog): bool
    {
        return $user->id === $securityLog->user_id;
    }

    public function forceDelete(User $user, SecurityLog $securityLog): bool
    {
        return $user->id === $securityLog->user_id;
    }
}
