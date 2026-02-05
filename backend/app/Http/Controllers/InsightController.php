<?php

namespace App\Http\Controllers;

use App\Models\Insight;
use App\Http\Requests\StoreInsightRequest;
use App\Http\Requests\UpdateInsightRequest;
use App\Http\Resources\InsightResource;
use Illuminate\Http\Request;

class InsightController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->insights();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return InsightResource::collection($resources);
    }

    public function store(StoreInsightRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $insight = Insight::create($validated);
        
        return new InsightResource($insight);
    }

    public function show(Insight $insight)
    {        $this->authorize('view', $insight);
                return new InsightResource($insight);
    }

    public function update(UpdateInsightRequest $request, Insight $insight)
    {        $this->authorize('update', $insight);
                $insight->update($request->validated());
        
        return new InsightResource($insight);
    }

    public function destroy(Insight $insight)
    {        $this->authorize('delete', $insight);
                $insight->delete();
        
        return response()->noContent();
    }
}
