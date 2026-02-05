<?php

namespace App\Policies;

use App\Models\User;
use App\Models\SplitExpenseParticipant;

class SplitExpenseParticipantPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SplitExpenseParticipant $splitExpenseParticipant): bool
    {
        return $user->id === $splitExpenseParticipant->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SplitExpenseParticipant $splitExpenseParticipant): bool
    {
        return $user->id === $splitExpenseParticipant->user_id;
    }

    public function delete(User $user, SplitExpenseParticipant $splitExpenseParticipant): bool
    {
        return $user->id === $splitExpenseParticipant->user_id;
    }

    public function restore(User $user, SplitExpenseParticipant $splitExpenseParticipant): bool
    {
        return $user->id === $splitExpenseParticipant->user_id;
    }

    public function forceDelete(User $user, SplitExpenseParticipant $splitExpenseParticipant): bool
    {
        return $user->id === $splitExpenseParticipant->user_id;
    }
}
