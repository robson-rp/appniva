<?php

namespace App\Http\Controllers;

use App\Models\BankReconciliation;
use App\Http\Requests\StoreBankReconciliationRequest;
use App\Http\Requests\UpdateBankReconciliationRequest;
use App\Http\Resources\BankReconciliationResource;
use Illuminate\Http\Request;

class BankReconciliationController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->bankReconciliations();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return BankReconciliationResource::collection($resources);
    }

    public function store(StoreBankReconciliationRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $bankReconciliation = BankReconciliation::create($validated);
        
        return new BankReconciliationResource($bankReconciliation);
    }

    public function show(BankReconciliation $bankReconciliation)
    {        $this->authorize('view', $bankReconciliation);
                return new BankReconciliationResource($bankReconciliation);
    }

    public function update(UpdateBankReconciliationRequest $request, BankReconciliation $bankReconciliation)
    {        $this->authorize('update', $bankReconciliation);
                $bankReconciliation->update($request->validated());
        
        return new BankReconciliationResource($bankReconciliation);
    }

    public function destroy(BankReconciliation $bankReconciliation)
    {        $this->authorize('delete', $bankReconciliation);
                $bankReconciliation->delete();
        
        return response()->noContent();
    }
}
