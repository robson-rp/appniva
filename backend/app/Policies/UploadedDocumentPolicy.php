<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\UploadedDocument;

class UploadedDocumentPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, UploadedDocument $uploadedDocument): bool
    {
        return $user->id === $uploadedDocument->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, UploadedDocument $uploadedDocument): bool
    {
        return $user->id === $uploadedDocument->user_id;
    }

    public function delete(Profile $user, UploadedDocument $uploadedDocument): bool
    {
        return $user->id === $uploadedDocument->user_id;
    }

    public function restore(Profile $user, UploadedDocument $uploadedDocument): bool
    {
        return $user->id === $uploadedDocument->user_id;
    }

    public function forceDelete(Profile $user, UploadedDocument $uploadedDocument): bool
    {
        return $user->id === $uploadedDocument->user_id;
    }
}
