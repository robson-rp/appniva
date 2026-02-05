<?php

namespace App\Http\Controllers;

use App\Models\TransactionTag;
use App\Http\Requests\StoreTransactionTagRequest;
use App\Http\Requests\UpdateTransactionTagRequest;
use App\Http\Resources\TransactionTagResource;
use Illuminate\Http\Request;

class TransactionTagController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->transactionTags();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return TransactionTagResource::collection($resources);
    }

    public function store(StoreTransactionTagRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $transactionTag = TransactionTag::create($validated);
        
        return new TransactionTagResource($transactionTag);
    }

    public function show(TransactionTag $transactionTag)
    {        $this->authorize('view', $transactionTag);
                return new TransactionTagResource($transactionTag);
    }

    public function update(UpdateTransactionTagRequest $request, TransactionTag $transactionTag)
    {        $this->authorize('update', $transactionTag);
                $transactionTag->update($request->validated());
        
        return new TransactionTagResource($transactionTag);
    }

    public function destroy(TransactionTag $transactionTag)
    {        $this->authorize('delete', $transactionTag);
                $transactionTag->delete();
        
        return response()->noContent();
    }
}
