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

    public function view(User $user, FinancialProduct ${strtolower(FinancialProduct)}): bool
    {
        return $user->id === ${strtolower(FinancialProduct)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, FinancialProduct ${strtolower(FinancialProduct)}): bool
    {
        return $user->id === ${strtolower(FinancialProduct)}->user_id;
    }

    public function delete(User $user, FinancialProduct ${strtolower(FinancialProduct)}): bool
    {
        return $user->id === ${strtolower(FinancialProduct)}->user_id;
    }

    public function restore(User $user, FinancialProduct ${strtolower(FinancialProduct)}): bool
    {
        return $user->id === ${strtolower(FinancialProduct)}->user_id;
    }

    public function forceDelete(User $user, FinancialProduct ${strtolower(FinancialProduct)}): bool
    {
        return $user->id === ${strtolower(FinancialProduct)}->user_id;
    }
}
