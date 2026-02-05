<?php

namespace App\Http\Controllers;

use App\Models\ExchangeRateAlert;
use App\Http\Requests\StoreExchangeRateAlertRequest;
use App\Http\Requests\UpdateExchangeRateAlertRequest;
use App\Http\Resources\ExchangeRateAlertResource;
use Illuminate\Http\Request;

class ExchangeRateAlertController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->exchangeRateAlerts();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return ExchangeRateAlertResource::collection($resources);
    }

    public function store(StoreExchangeRateAlertRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $exchangeRateAlert = ExchangeRateAlert::create($validated);
        
        return new ExchangeRateAlertResource($exchangeRateAlert);
    }

    public function show(ExchangeRateAlert $exchangeRateAlert)
    {        $this->authorize('view', $exchangeRateAlert);
                return new ExchangeRateAlertResource($exchangeRateAlert);
    }

    public function update(UpdateExchangeRateAlertRequest $request, ExchangeRateAlert $exchangeRateAlert)
    {        $this->authorize('update', $exchangeRateAlert);
                $exchangeRateAlert->update($request->validated());
        
        return new ExchangeRateAlertResource($exchangeRateAlert);
    }

    public function destroy(ExchangeRateAlert $exchangeRateAlert)
    {        $this->authorize('delete', $exchangeRateAlert);
                $exchangeRateAlert->delete();
        
        return response()->noContent();
    }
}
