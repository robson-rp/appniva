<?php

namespace App\Http\Controllers;

use App\Models\SplitExpensePaymentHistory;
use App\Http\Requests\StoreSplitExpensePaymentHistoryRequest;
use App\Http\Requests\UpdateSplitExpensePaymentHistoryRequest;
use App\Http\Resources\SplitExpensePaymentHistoryResource;
use Illuminate\Http\Request;

class SplitExpensePaymentHistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->splitExpensePaymentHistories();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return SplitExpensePaymentHistoryResource::collection($resources);
    }

    public function store(StoreSplitExpensePaymentHistoryRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $splitExpensePaymentHistory = SplitExpensePaymentHistory::create($validated);
        
        return new SplitExpensePaymentHistoryResource($splitExpensePaymentHistory);
    }

    public function show(SplitExpensePaymentHistory $splitExpensePaymentHistory)
    {        $this->authorize('view', $splitExpensePaymentHistory);
                return new SplitExpensePaymentHistoryResource($splitExpensePaymentHistory);
    }

    public function update(UpdateSplitExpensePaymentHistoryRequest $request, SplitExpensePaymentHistory $splitExpensePaymentHistory)
    {        $this->authorize('update', $splitExpensePaymentHistory);
                $splitExpensePaymentHistory->update($request->validated());
        
        return new SplitExpensePaymentHistoryResource($splitExpensePaymentHistory);
    }

    public function destroy(SplitExpensePaymentHistory $splitExpensePaymentHistory)
    {        $this->authorize('delete', $splitExpensePaymentHistory);
                $splitExpensePaymentHistory->delete();
        
        return response()->noContent();
    }
}
