<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};


use Illuminate\Database\Eloquent\Model;

class ParticipantGroup extends Model
{
    //
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function participantGroupMembers(): HasMany
    {
        return $this->hasMany(ParticipantGroupMember::class);
    }


}
