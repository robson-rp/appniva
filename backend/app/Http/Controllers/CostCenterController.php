<?php

namespace App\Http\Controllers;

use App\Models\CostCenter;
use App\Http\Requests\StoreCostCenterRequest;
use App\Http\Requests\UpdateCostCenterRequest;
use App\Http\Resources\CostCenterResource;
use Illuminate\Http\Request;

class CostCenterController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->costCenters();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return CostCenterResource::collection($resources);
    }

    public function store(StoreCostCenterRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $costCenter = CostCenter::create($validated);
        
        return new CostCenterResource($costCenter);
    }

    public function show(CostCenter $costCenter)
    {        $this->authorize('view', $costCenter);
                return new CostCenterResource($costCenter);
    }

    public function update(UpdateCostCenterRequest $request, CostCenter $costCenter)
    {        $this->authorize('update', $costCenter);
                $costCenter->update($request->validated());
        
        return new CostCenterResource($costCenter);
    }

    public function destroy(CostCenter $costCenter)
    {        $this->authorize('delete', $costCenter);
                $costCenter->delete();
        
        return response()->noContent();
    }
}
