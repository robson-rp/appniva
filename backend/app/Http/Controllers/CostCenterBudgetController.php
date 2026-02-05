<?php

namespace App\Http\Controllers;

use App\Models\CostCenterBudget;
use App\Http\Requests\StoreCostCenterBudgetRequest;
use App\Http\Requests\UpdateCostCenterBudgetRequest;
use App\Http\Resources\CostCenterBudgetResource;
use Illuminate\Http\Request;

class CostCenterBudgetController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->costCenterBudgets();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return CostCenterBudgetResource::collection($resources);
    }

    public function store(StoreCostCenterBudgetRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $costCenterBudget = CostCenterBudget::create($validated);
        
        return new CostCenterBudgetResource($costCenterBudget);
    }

    public function show(CostCenterBudget $costCenterBudget)
    {        $this->authorize('view', $costCenterBudget);
                return new CostCenterBudgetResource($costCenterBudget);
    }

    public function update(UpdateCostCenterBudgetRequest $request, CostCenterBudget $costCenterBudget)
    {        $this->authorize('update', $costCenterBudget);
                $costCenterBudget->update($request->validated());
        
        return new CostCenterBudgetResource($costCenterBudget);
    }

    public function destroy(CostCenterBudget $costCenterBudget)
    {        $this->authorize('delete', $costCenterBudget);
                $costCenterBudget->delete();
        
        return response()->noContent();
    }
}
