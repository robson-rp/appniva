<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\CostCenter;

class CostCenterPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, CostCenter $costCenter): bool
    {
        return $user->id === $costCenter->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, CostCenter $costCenter): bool
    {
        return $user->id === $costCenter->user_id;
    }

    public function delete(Profile $user, CostCenter $costCenter): bool
    {
        return $user->id === $costCenter->user_id;
    }

    public function restore(Profile $user, CostCenter $costCenter): bool
    {
        return $user->id === $costCenter->user_id;
    }

    public function forceDelete(Profile $user, CostCenter $costCenter): bool
    {
        return $user->id === $costCenter->user_id;
    }
}
