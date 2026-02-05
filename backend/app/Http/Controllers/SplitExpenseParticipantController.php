<?php

namespace App\Http\Controllers;

use App\Models\SplitExpenseParticipant;
use App\Http\Requests\StoreSplitExpenseParticipantRequest;
use App\Http\Requests\UpdateSplitExpenseParticipantRequest;
use App\Http\Resources\SplitExpenseParticipantResource;
use Illuminate\Http\Request;

class SplitExpenseParticipantController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->splitExpenseParticipants();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return SplitExpenseParticipantResource::collection($resources);
    }

    public function store(StoreSplitExpenseParticipantRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $splitExpenseParticipant = SplitExpenseParticipant::create($validated);
        
        return new SplitExpenseParticipantResource($splitExpenseParticipant);
    }

    public function show(SplitExpenseParticipant $splitExpenseParticipant)
    {        $this->authorize('view', $splitExpenseParticipant);
                return new SplitExpenseParticipantResource($splitExpenseParticipant);
    }

    public function update(UpdateSplitExpenseParticipantRequest $request, SplitExpenseParticipant $splitExpenseParticipant)
    {        $this->authorize('update', $splitExpenseParticipant);
                $splitExpenseParticipant->update($request->validated());
        
        return new SplitExpenseParticipantResource($splitExpenseParticipant);
    }

    public function destroy(SplitExpenseParticipant $splitExpenseParticipant)
    {        $this->authorize('delete', $splitExpenseParticipant);
                $splitExpenseParticipant->delete();
        
        return response()->noContent();
    }
}
