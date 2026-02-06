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
        $month = $request->input('month', now()->format('Y-m'));
        $query = auth()->user()->budgets()->with('category')->where('month', $month);
        
        $budgets = $query->get();
        
        // Calculate spending for each budget
        $startDate = "$month-01";
        $endDate = date('Y-m-t', strtotime($startDate));
        
        $expenses = auth()->user()->transactions()
            ->where('type', 'expense')
            ->whereBetween('date', [$startDate, $endDate])
            ->get()
            ->groupBy('category_id')
            ->map(fn($group) => $group->sum('amount'));

        $budgets->each(function($budget) use ($expenses) {
            $budget->spent = $expenses->get($budget->category_id, 0);
            $budget->percentage = $budget->amount_limit > 0 
                ? round(($budget->spent / $budget->amount_limit) * 100) 
                : 0;
        });
        
        return BudgetResource::collection($budgets);
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