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

    public function view(User $user, CostCenter $costCenter): bool
    {
        return $user->id === $costCenter->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, CostCenter $costCenter): bool
    {
        return $user->id === $costCenter->user_id;
    }

    public function delete(User $user, CostCenter $costCenter): bool
    {
        return $user->id === $costCenter->user_id;
    }

    public function restore(User $user, CostCenter $costCenter): bool
    {
        return $user->id === $costCenter->user_id;
    }

    public function forceDelete(User $user, CostCenter $costCenter): bool
    {
        return $user->id === $costCenter->user_id;
    }
}
