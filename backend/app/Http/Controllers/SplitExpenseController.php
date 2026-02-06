<?php

namespace App\Http\Controllers;

use App\Models\SplitExpense;
use App\Http\Requests\StoreSplitExpenseRequest;
use App\Http\Requests\UpdateSplitExpenseRequest;
use App\Http\Resources\SplitExpenseResource;
use Illuminate\Http\Request;

class SplitExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->splitExpenses();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return SplitExpenseResource::collection($resources);
    }

    public function store(StoreSplitExpenseRequest $request)
    {
        $validated = $request->validated();
        $validated['creator_id'] = auth()->id();
        $splitExpense = SplitExpense::create($validated);
        
        return new SplitExpenseResource($splitExpense);
    }

    public function show(SplitExpense $splitExpense)
    {
        if ($splitExpense->creator_id !== auth()->id()) {
            abort(403);
        }
        return new SplitExpenseResource($splitExpense);
    }

    public function update(UpdateSplitExpenseRequest $request, SplitExpense $splitExpense)
    {
        if ($splitExpense->creator_id !== auth()->id()) {
            abort(403);
        }
        $splitExpense->update($request->validated());
        
        return new SplitExpenseResource($splitExpense);
    }

    public function destroy(SplitExpense $splitExpense)
    {
        if ($splitExpense->creator_id !== auth()->id()) {
            abort(403);
        }
        $splitExpense->delete();
        
        return response()->noContent();
    }
}
