<?php

namespace App\Http\Controllers;

use App\Models\GoalContribution;
use App\Http\Requests\StoreGoalContributionRequest;
use App\Http\Requests\UpdateGoalContributionRequest;
use App\Http\Resources\GoalContributionResource;
use Illuminate\Http\Request;

class GoalContributionController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->goalContributions();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return GoalContributionResource::collection($resources);
    }

    public function store(StoreGoalContributionRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $goalContribution = GoalContribution::create($validated);
        
        return new GoalContributionResource($goalContribution);
    }

    public function show(GoalContribution $goalContribution)
    {        $this->authorize('view', $goalContribution);
                return new GoalContributionResource($goalContribution);
    }

    public function update(UpdateGoalContributionRequest $request, GoalContribution $goalContribution)
    {        $this->authorize('update', $goalContribution);
                $goalContribution->update($request->validated());
        
        return new GoalContributionResource($goalContribution);
    }

    public function destroy(GoalContribution $goalContribution)
    {        $this->authorize('delete', $goalContribution);
                $goalContribution->delete();
        
        return response()->noContent();
    }
}
