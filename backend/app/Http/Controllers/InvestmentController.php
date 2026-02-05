<?php

namespace App\Http\Controllers;

use App\Models\Investment;
use App\Http\Requests\StoreInvestmentRequest;
use App\Http\Requests\UpdateInvestmentRequest;
use App\Http\Resources\InvestmentResource;
use Illuminate\Http\Request;

class InvestmentController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->investments();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return InvestmentResource::collection($resources);
    }

    public function store(StoreInvestmentRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $investment = Investment::create($validated);
        
        return new InvestmentResource($investment);
    }

    public function show(Investment $investment)
    {        $this->authorize('view', $investment);
                return new InvestmentResource($investment);
    }

    public function update(UpdateInvestmentRequest $request, Investment $investment)
    {        $this->authorize('update', $investment);
                $investment->update($request->validated());
        
        return new InvestmentResource($investment);
    }

    public function destroy(Investment $investment)
    {        $this->authorize('delete', $investment);
                $investment->delete();
        
        return response()->noContent();
    }
}
