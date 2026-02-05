<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UploadedDocument;

class UploadedDocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, UploadedDocument $uploadedDocument): bool
    {
        return $user->id === $uploadedDocument->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, UploadedDocument $uploadedDocument): bool
    {
        return $user->id === $uploadedDocument->user_id;
    }

    public function delete(User $user, UploadedDocument $uploadedDocument): bool
    {
        return $user->id === $uploadedDocument->user_id;
    }

    public function restore(User $user, UploadedDocument $uploadedDocument): bool
    {
        return $user->id === $uploadedDocument->user_id;
    }

    public function forceDelete(User $user, UploadedDocument $uploadedDocument): bool
    {
        return $user->id === $uploadedDocument->user_id;
    }
}
