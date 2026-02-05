<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ParticipantGroup;

class ParticipantGroupPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ParticipantGroup $participantGroup): bool
    {
        return $user->id === $participantGroup->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ParticipantGroup $participantGroup): bool
    {
        return $user->id === $participantGroup->user_id;
    }

    public function delete(User $user, ParticipantGroup $participantGroup): bool
    {
        return $user->id === $participantGroup->user_id;
    }

    public function restore(User $user, ParticipantGroup $participantGroup): bool
    {
        return $user->id === $participantGroup->user_id;
    }

    public function forceDelete(User $user, ParticipantGroup $participantGroup): bool
    {
        return $user->id === $participantGroup->user_id;
    }
}
