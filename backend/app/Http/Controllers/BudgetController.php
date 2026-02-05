<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Http\Resources\BudgetResource;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = auth()->user()->Budgets();
        
        // Paginação
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return BudgetResource::collection($resources);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBudgetRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        
        $Budget = Budget::create($validated);
        
        return new BudgetResource($Budget);
    }

    /**
     * Display the specified resource.
     */
    public function show(Budget $Budget)
    {
        $this->authorize('view', $Budget);
        
        return new BudgetResource($Budget);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBudgetRequest $request, Budget $Budget)
    {
        $this->authorize('update', $Budget);
        
        $Budget->update($request->validated());
        
        return new BudgetResource($Budget);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Budget $Budget)
    {
        $this->authorize('delete', $Budget);
        
        $Budget->delete();
        
        return response()->noContent();
    }
}