<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ProductRequest;

class ProductRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ProductRequest ${strtolower(ProductRequest)}): bool
    {
        return $user->id === ${strtolower(ProductRequest)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ProductRequest ${strtolower(ProductRequest)}): bool
    {
        return $user->id === ${strtolower(ProductRequest)}->user_id;
    }

    public function delete(User $user, ProductRequest ${strtolower(ProductRequest)}): bool
    {
        return $user->id === ${strtolower(ProductRequest)}->user_id;
    }

    public function restore(User $user, ProductRequest ${strtolower(ProductRequest)}): bool
    {
        return $user->id === ${strtolower(ProductRequest)}->user_id;
    }

    public function forceDelete(User $user, ProductRequest ${strtolower(ProductRequest)}): bool
    {
        return $user->id === ${strtolower(ProductRequest)}->user_id;
    }
}
