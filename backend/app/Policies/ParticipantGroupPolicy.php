<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\ParticipantGroup;

class ParticipantGroupPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, ParticipantGroup $participantGroup): bool
    {
        return $user->id === $participantGroup->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, ParticipantGroup $participantGroup): bool
    {
        return $user->id === $participantGroup->user_id;
    }

    public function delete(Profile $user, ParticipantGroup $participantGroup): bool
    {
        return $user->id === $participantGroup->user_id;
    }

    public function restore(Profile $user, ParticipantGroup $participantGroup): bool
    {
        return $user->id === $participantGroup->user_id;
    }

    public function forceDelete(Profile $user, ParticipantGroup $participantGroup): bool
    {
        return $user->id === $participantGroup->user_id;
    }
}
