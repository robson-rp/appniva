<?php

namespace App\Http\Controllers;

use App\Models\ParticipantGroupMember;
use App\Http\Requests\StoreParticipantGroupMemberRequest;
use App\Http\Requests\UpdateParticipantGroupMemberRequest;
use App\Http\Resources\ParticipantGroupMemberResource;
use Illuminate\Http\Request;

class ParticipantGroupMemberController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->participantGroupMembers();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return ParticipantGroupMemberResource::collection($resources);
    }

    public function store(StoreParticipantGroupMemberRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $participantGroupMember = ParticipantGroupMember::create($validated);
        
        return new ParticipantGroupMemberResource($participantGroupMember);
    }

    public function show(ParticipantGroupMember $participantGroupMember)
    {        $this->authorize('view', $participantGroupMember);
                return new ParticipantGroupMemberResource($participantGroupMember);
    }

    public function update(UpdateParticipantGroupMemberRequest $request, ParticipantGroupMember $participantGroupMember)
    {        $this->authorize('update', $participantGroupMember);
                $participantGroupMember->update($request->validated());
        
        return new ParticipantGroupMemberResource($participantGroupMember);
    }

    public function destroy(ParticipantGroupMember $participantGroupMember)
    {        $this->authorize('delete', $participantGroupMember);
                $participantGroupMember->delete();
        
        return response()->noContent();
    }
}
