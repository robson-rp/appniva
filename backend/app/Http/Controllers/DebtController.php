<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use App\Http\Requests\StoreDebtRequest;
use App\Http\Requests\UpdateDebtRequest;
use App\Http\Resources\DebtResource;
use Illuminate\Http\Request;

class DebtController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = auth()->user()->Debts();
        
        // Paginação
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return DebtResource::collection($resources);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDebtRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        
        $Debt = Debt::create($validated);
        
        return new DebtResource($Debt);
    }

    /**
     * Display the specified resource.
     */
    public function show(Debt $Debt)
    {
        $this->authorize('view', $Debt);
        
        return new DebtResource($Debt);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDebtRequest $request, Debt $Debt)
    {
        $this->authorize('update', $Debt);
        
        $Debt->update($request->validated());
        
        return new DebtResource($Debt);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Debt $Debt)
    {
        $this->authorize('delete', $Debt);
        
        $Debt->delete();
        
        return response()->noContent();
    }
}