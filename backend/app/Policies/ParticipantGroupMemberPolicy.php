<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ParticipantGroupMember;

class ParticipantGroupMemberPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ParticipantGroupMember ${strtolower(ParticipantGroupMember)}): bool
    {
        return $user->id === ${strtolower(ParticipantGroupMember)}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ParticipantGroupMember ${strtolower(ParticipantGroupMember)}): bool
    {
        return $user->id === ${strtolower(ParticipantGroupMember)}->user_id;
    }

    public function delete(User $user, ParticipantGroupMember ${strtolower(ParticipantGroupMember)}): bool
    {
        return $user->id === ${strtolower(ParticipantGroupMember)}->user_id;
    }

    public function restore(User $user, ParticipantGroupMember ${strtolower(ParticipantGroupMember)}): bool
    {
        return $user->id === ${strtolower(ParticipantGroupMember)}->user_id;
    }

    public function forceDelete(User $user, ParticipantGroupMember ${strtolower(ParticipantGroupMember)}): bool
    {
        return $user->id === ${strtolower(ParticipantGroupMember)}->user_id;
    }
}
