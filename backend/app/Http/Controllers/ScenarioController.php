<?php

namespace App\Http\Controllers;

use App\Models\Scenario;
use App\Http\Requests\StoreScenarioRequest;
use App\Http\Requests\UpdateScenarioRequest;
use App\Http\Resources\ScenarioResource;
use Illuminate\Http\Request;

class ScenarioController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->scenarios();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return ScenarioResource::collection($resources);
    }

    public function store(StoreScenarioRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $scenario = Scenario::create($validated);
        
        return new ScenarioResource($scenario);
    }

    public function show(Scenario $scenario)
    {        $this->authorize('view', $scenario);
                return new ScenarioResource($scenario);
    }

    public function update(UpdateScenarioRequest $request, Scenario $scenario)
    {        $this->authorize('update', $scenario);
                $scenario->update($request->validated());
        
        return new ScenarioResource($scenario);
    }

    public function destroy(Scenario $scenario)
    {        $this->authorize('delete', $scenario);
                $scenario->delete();
        
        return response()->noContent();
    }
}
