<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\ParticipantGroupMember;

class ParticipantGroupMemberPolicy
{
    public function viewAny(Profile $user): bool
    {
        return true;
    }

    public function view(Profile $user, ParticipantGroupMember $participantGroupMember): bool
    {
        return $user->id === $participantGroupMember->user_id;
    }

    public function create(Profile $user): bool
    {
        return true;
    }

    public function update(Profile $user, ParticipantGroupMember $participantGroupMember): bool
    {
        return $user->id === $participantGroupMember->user_id;
    }

    public function delete(Profile $user, ParticipantGroupMember $participantGroupMember): bool
    {
        return $user->id === $participantGroupMember->user_id;
    }

    public function restore(Profile $user, ParticipantGroupMember $participantGroupMember): bool
    {
        return $user->id === $participantGroupMember->user_id;
    }

    public function forceDelete(Profile $user, ParticipantGroupMember $participantGroupMember): bool
    {
        return $user->id === $participantGroupMember->user_id;
    }
}
