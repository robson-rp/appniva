<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\FinancialProduct;

class FinancialProductPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, FinancialProduct $financialProduct): bool
    {
        return $user->id === $financialProduct->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, FinancialProduct $financialProduct): bool
    {
        return $user->id === $financialProduct->user_id;
    }

    public function delete(Profile $user, FinancialProduct $financialProduct): bool
    {
        return $user->id === $financialProduct->user_id;
    }

    public function restore(Profile $user, FinancialProduct $financialProduct): bool
    {
        return $user->id === $financialProduct->user_id;
    }

    public function forceDelete(Profile $user, FinancialProduct $financialProduct): bool
    {
        return $user->id === $financialProduct->user_id;
    }
}
