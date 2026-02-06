<?php

namespace App\Http\Controllers;

use App\Models\RecurringTransaction;
use App\Http\Requests\StoreRecurringTransactionRequest;
use App\Http\Requests\UpdateRecurringTransactionRequest;
use App\Http\Resources\RecurringTransactionResource;
use Illuminate\Http\Request;

class RecurringTransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->recurringTransactions()->with(['account', 'category', 'costCenter']);
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return RecurringTransactionResource::collection($resources);
    }

    public function store(StoreRecurringTransactionRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $recurringTransaction = RecurringTransaction::create($validated);
        
        return new RecurringTransactionResource($recurringTransaction);
    }

    public function show(RecurringTransaction $recurringTransaction)
    {        $this->authorize('view', $recurringTransaction);
                return new RecurringTransactionResource($recurringTransaction);
    }

    public function update(UpdateRecurringTransactionRequest $request, RecurringTransaction $recurringTransaction)
    {        $this->authorize('update', $recurringTransaction);
                $recurringTransaction->update($request->validated());
        
        return new RecurringTransactionResource($recurringTransaction);
    }

    public function destroy(RecurringTransaction $recurringTransaction)
    {        $this->authorize('delete', $recurringTransaction);
                $recurringTransaction->delete();
        
        return response()->noContent();
    }
}
