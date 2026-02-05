<?php

namespace App\Policies;

use App\Models\User;
use App\Models\AdminAuditLog;

class AdminAuditLogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_admin; // Apenas admins
    }

    public function view(User $user, AdminAuditLog $adminAuditLog): bool
    {
        return $user->is_admin;
    }

    public function create(User $user): bool
    {
        return $user->is_admin;
    }

    public function update(User $user, AdminAuditLog $adminAuditLog): bool
    {
        return $user->is_admin;
    }

    public function delete(User $user, AdminAuditLog $adminAuditLog): bool
    {
        return $user->is_admin;
    }

    public function restore(User $user, AdminAuditLog $adminAuditLog): bool
    {
        return $user->is_admin;
    }

    public function forceDelete(User $user, AdminAuditLog $adminAuditLog): bool
    {
        return $user->is_admin;
    }
}
