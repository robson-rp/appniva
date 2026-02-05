<?php

namespace App\Http\Controllers;

use App\Models\FinancialScore;
use App\Http\Requests\StoreFinancialScoreRequest;
use App\Http\Requests\UpdateFinancialScoreRequest;
use App\Http\Resources\FinancialScoreResource;
use Illuminate\Http\Request;

class FinancialScoreController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->financialScores();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return FinancialScoreResource::collection($resources);
    }

    public function store(StoreFinancialScoreRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $financialScore = FinancialScore::create($validated);
        
        return new FinancialScoreResource($financialScore);
    }

    public function show(FinancialScore $financialScore)
    {        $this->authorize('view', $financialScore);
                return new FinancialScoreResource($financialScore);
    }

    public function update(UpdateFinancialScoreRequest $request, FinancialScore $financialScore)
    {        $this->authorize('update', $financialScore);
                $financialScore->update($request->validated());
        
        return new FinancialScoreResource($financialScore);
    }

    public function destroy(FinancialScore $financialScore)
    {        $this->authorize('delete', $financialScore);
                $financialScore->delete();
        
        return response()->noContent();
    }
}
