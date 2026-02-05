<?php

namespace App\Policies;

use App\Models\User;
use App\Models\FinancialProduct;

class FinancialProductPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, FinancialProduct $financialProduct): bool
    {
        return $user->id === $financialProduct->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, FinancialProduct $financialProduct): bool
    {
        return $user->id === $financialProduct->user_id;
    }

    public function delete(User $user, FinancialProduct $financialProduct): bool
    {
        return $user->id === $financialProduct->user_id;
    }

    public function restore(User $user, FinancialProduct $financialProduct): bool
    {
        return $user->id === $financialProduct->user_id;
    }

    public function forceDelete(User $user, FinancialProduct $financialProduct): bool
    {
        return $user->id === $financialProduct->user_id;
    }
}
