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

    public function view(User $user, ProductRequest $productRequest): bool
    {
        return $user->id === $productRequest->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ProductRequest $productRequest): bool
    {
        return $user->id === $productRequest->user_id;
    }

    public function delete(User $user, ProductRequest $productRequest): bool
    {
        return $user->id === $productRequest->user_id;
    }

    public function restore(User $user, ProductRequest $productRequest): bool
    {
        return $user->id === $productRequest->user_id;
    }

    public function forceDelete(User $user, ProductRequest $productRequest): bool
    {
        return $user->id === $productRequest->user_id;
    }
}
