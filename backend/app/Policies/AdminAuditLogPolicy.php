<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\AdminAuditLog;

class AdminAuditLogPolicy
{
    public function viewAny(Profile $user): bool
    {
        return $user->is_admin; // Apenas admins
    }

    public function view(Profile $user, AdminAuditLog $adminAuditLog): bool
    {
        return $user->is_admin;
    }

    public function create(Profile $user): bool
    {
        return $user->is_admin;
    }

    public function update(Profile $user, AdminAuditLog $adminAuditLog): bool
    {
        return $user->is_admin;
    }

    public function delete(Profile $user, AdminAuditLog $adminAuditLog): bool
    {
        return $user->is_admin;
    }

    public function restore(Profile $user, AdminAuditLog $adminAuditLog): bool
    {
        return $user->is_admin;
    }

    public function forceDelete(Profile $user, AdminAuditLog $adminAuditLog): bool
    {
        return $user->is_admin;
    }
}
