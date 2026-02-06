<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\ProductRequest;

class ProductRequestPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, ProductRequest $productRequest): bool
    {
        return $user->id === $productRequest->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, ProductRequest $productRequest): bool
    {
        return $user->id === $productRequest->user_id;
    }

    public function delete(Profile $user, ProductRequest $productRequest): bool
    {
        return $user->id === $productRequest->user_id;
    }

    public function restore(Profile $user, ProductRequest $productRequest): bool
    {
        return $user->id === $productRequest->user_id;
    }

    public function forceDelete(Profile $user, ProductRequest $productRequest): bool
    {
        return $user->id === $productRequest->user_id;
    }
}
