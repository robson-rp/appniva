<?php

namespace App\Http\Controllers;

use App\Models\DailyRecommendation;
use App\Http\Requests\StoreDailyRecommendationRequest;
use App\Http\Requests\UpdateDailyRecommendationRequest;
use App\Http\Resources\DailyRecommendationResource;
use Illuminate\Http\Request;

class DailyRecommendationController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->dailyRecommendations();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return DailyRecommendationResource::collection($resources);
    }

    public function store(StoreDailyRecommendationRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $dailyRecommendation = DailyRecommendation::create($validated);
        
        return new DailyRecommendationResource($dailyRecommendation);
    }

    public function show(DailyRecommendation $dailyRecommendation)
    {        $this->authorize('view', $dailyRecommendation);
                return new DailyRecommendationResource($dailyRecommendation);
    }

    public function update(UpdateDailyRecommendationRequest $request, DailyRecommendation $dailyRecommendation)
    {        $this->authorize('update', $dailyRecommendation);
                $dailyRecommendation->update($request->validated());
        
        return new DailyRecommendationResource($dailyRecommendation);
    }

    public function destroy(DailyRecommendation $dailyRecommendation)
    {        $this->authorize('delete', $dailyRecommendation);
                $dailyRecommendation->delete();
        
        return response()->noContent();
    }
}
