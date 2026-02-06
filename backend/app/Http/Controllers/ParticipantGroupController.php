<?php

namespace App\Http\Controllers;

use App\Models\ParticipantGroup;
use App\Http\Requests\StoreParticipantGroupRequest;
use App\Http\Requests\UpdateParticipantGroupRequest;
use App\Http\Resources\ParticipantGroupResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParticipantGroupController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->participantGroups()->with('members');
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return ParticipantGroupResource::collection($resources);
    }

    public function store(StoreParticipantGroupRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        
        $participantGroup = DB::transaction(function () use ($validated, $request) {
            $group = ParticipantGroup::create([
                'name' => $validated['name'],
                'user_id' => $validated['user_id']
            ]);

            if ($request->has('members')) {
                $group->members()->createMany($request->members);
            }
            
            return $group;
        });
        
        return new ParticipantGroupResource($participantGroup->load('members'));
    }

    public function show(ParticipantGroup $participantGroup)
    {        $this->authorize('view', $participantGroup);
                return new ParticipantGroupResource($participantGroup);
    }

    public function update(UpdateParticipantGroupRequest $request, ParticipantGroup $participantGroup)
    {        $this->authorize('update', $participantGroup);
                $participantGroup->update($request->validated());
        
        return new ParticipantGroupResource($participantGroup);
    }

    public function destroy(ParticipantGroup $participantGroup)
    {        $this->authorize('delete', $participantGroup);
                $participantGroup->delete();
        
        return response()->noContent();
    }
}
