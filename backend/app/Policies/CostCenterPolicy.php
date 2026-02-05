<?php

namespace App\Policies;

use App\Models\User;
use App\Models\CostCenter;

class CostCenterPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CostCenter ${strtolower(CostCenter)}): bool
    {
        return $user->id === ${strtolower(CostCenter)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, CostCenter ${strtolower(CostCenter)}): bool
    {
        return $user->id === ${strtolower(CostCenter)}->user_id;
    }

    public function delete(User $user, CostCenter ${strtolower(CostCenter)}): bool
    {
        return $user->id === ${strtolower(CostCenter)}->user_id;
    }

    public function restore(User $user, CostCenter ${strtolower(CostCenter)}): bool
    {
        return $user->id === ${strtolower(CostCenter)}->user_id;
    }

    public function forceDelete(User $user, CostCenter ${strtolower(CostCenter)}): bool
    {
        return $user->id === ${strtolower(CostCenter)}->user_id;
    }
}
