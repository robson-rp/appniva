<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = auth()->user()->Transactions();
        
        // Paginação
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return TransactionResource::collection($resources);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTransactionRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        
        $Transaction = Transaction::create($validated);
        
        return new TransactionResource($Transaction);
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $Transaction)
    {
        $this->authorize('view', $Transaction);
        
        return new TransactionResource($Transaction);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTransactionRequest $request, Transaction $Transaction)
    {
        $this->authorize('update', $Transaction);
        
        $Transaction->update($request->validated());
        
        return new TransactionResource($Transaction);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $Transaction)
    {
        $this->authorize('delete', $Transaction);
        
        $Transaction->delete();
        
        return response()->noContent();
    }
}