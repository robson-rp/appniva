<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Http\Requests\StoreGoalRequest;
use App\Http\Requests\UpdateGoalRequest;
use App\Http\Resources\GoalResource;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $goals = auth()->user()->goals()->get();
        
        $goals->each(function($goal) {
            // In Appniva, goals can have contributions or be linked to transactions.
            // Let's assume current_amount is tracked in the model or via contributions.
            // For now, we'll use the model value if exists, or calculate if we had a contributions table.
            
            $goal->percentage = $goal->target_amount > 0 
                ? round(($goal->current_amount / $goal->target_amount) * 100)
                : 0;
        });
        
        return GoalResource::collection($goals);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGoalRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        
        $Goal = Goal::create($validated);
        
        return new GoalResource($Goal);
    }

    /**
     * Display the specified resource.
     */
    public function show(Goal $Goal)
    {
        $this->authorize('view', $Goal);
        
        return new GoalResource($Goal);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGoalRequest $request, Goal $Goal)
    {
        $this->authorize('update', $Goal);
        
        $Goal->update($request->validated());
        
        return new GoalResource($Goal);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Goal $Goal)
    {
        $this->authorize('delete', $Goal);
        
        $Goal->delete();
        
        return response()->noContent();
    }
}