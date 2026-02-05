<?php

namespace App\Http\Controllers;

use App\Models\InflationRate;
use App\Http\Requests\StoreInflationRateRequest;
use App\Http\Requests\UpdateInflationRateRequest;
use App\Http\Resources\InflationRateResource;
use Illuminate\Http\Request;

class InflationRateController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->inflationRates();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return InflationRateResource::collection($resources);
    }

    public function store(StoreInflationRateRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $inflationRate = InflationRate::create($validated);
        
        return new InflationRateResource($inflationRate);
    }

    public function show(InflationRate $inflationRate)
    {        $this->authorize('view', $inflationRate);
                return new InflationRateResource($inflationRate);
    }

    public function update(UpdateInflationRateRequest $request, InflationRate $inflationRate)
    {        $this->authorize('update', $inflationRate);
                $inflationRate->update($request->validated());
        
        return new InflationRateResource($inflationRate);
    }

    public function destroy(InflationRate $inflationRate)
    {        $this->authorize('delete', $inflationRate);
                $inflationRate->delete();
        
        return response()->noContent();
    }
}
