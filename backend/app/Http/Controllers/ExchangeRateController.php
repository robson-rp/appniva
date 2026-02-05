<?php

namespace App\Http\Controllers;

use App\Models\ExchangeRate;
use App\Http\Requests\StoreExchangeRateRequest;
use App\Http\Requests\UpdateExchangeRateRequest;
use App\Http\Resources\ExchangeRateResource;
use Illuminate\Http\Request;

class ExchangeRateController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->exchangeRates();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return ExchangeRateResource::collection($resources);
    }

    public function store(StoreExchangeRateRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $exchangeRate = ExchangeRate::create($validated);
        
        return new ExchangeRateResource($exchangeRate);
    }

    public function show(ExchangeRate $exchangeRate)
    {        $this->authorize('view', $exchangeRate);
                return new ExchangeRateResource($exchangeRate);
    }

    public function update(UpdateExchangeRateRequest $request, ExchangeRate $exchangeRate)
    {        $this->authorize('update', $exchangeRate);
                $exchangeRate->update($request->validated());
        
        return new ExchangeRateResource($exchangeRate);
    }

    public function destroy(ExchangeRate $exchangeRate)
    {        $this->authorize('delete', $exchangeRate);
                $exchangeRate->delete();
        
        return response()->noContent();
    }
}
