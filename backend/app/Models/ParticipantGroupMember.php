<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsTo};


use Illuminate\Database\Eloquent\Model;

class ParticipantGroupMember extends Model
{
    //
    public function participantGroup(): BelongsTo
    {
        return $this->belongsTo(ParticipantGroup::class);
    }


}
