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
                $validated['user_id'] = auth()->id();
                $splitExpense = SplitExpense::create($validated);
        
        return new SplitExpenseResource($splitExpense);
    }

    public function show(SplitExpense $splitExpense)
    {        $this->authorize('view', $splitExpense);
                return new SplitExpenseResource($splitExpense);
    }

    public function update(UpdateSplitExpenseRequest $request, SplitExpense $splitExpense)
    {        $this->authorize('update', $splitExpense);
                $splitExpense->update($request->validated());
        
        return new SplitExpenseResource($splitExpense);
    }

    public function destroy(SplitExpense $splitExpense)
    {        $this->authorize('delete', $splitExpense);
                $splitExpense->delete();
        
        return response()->noContent();
    }
}
