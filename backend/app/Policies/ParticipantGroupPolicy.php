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

    public function view(User $user, ParticipantGroup ${strtolower(ParticipantGroup)}): bool
    {
        return $user->id === ${strtolower(ParticipantGroup)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ParticipantGroup ${strtolower(ParticipantGroup)}): bool
    {
        return $user->id === ${strtolower(ParticipantGroup)}->user_id;
    }

    public function delete(User $user, ParticipantGroup ${strtolower(ParticipantGroup)}): bool
    {
        return $user->id === ${strtolower(ParticipantGroup)}->user_id;
    }

    public function restore(User $user, ParticipantGroup ${strtolower(ParticipantGroup)}): bool
    {
        return $user->id === ${strtolower(ParticipantGroup)}->user_id;
    }

    public function forceDelete(User $user, ParticipantGroup ${strtolower(ParticipantGroup)}): bool
    {
        return $user->id === ${strtolower(ParticipantGroup)}->user_id;
    }
}
