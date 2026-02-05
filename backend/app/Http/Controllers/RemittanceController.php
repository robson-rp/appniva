<?php

namespace App\Http\Controllers;

use App\Models\Remittance;
use App\Http\Requests\StoreRemittanceRequest;
use App\Http\Requests\UpdateRemittanceRequest;
use App\Http\Resources\RemittanceResource;
use Illuminate\Http\Request;

class RemittanceController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->remittances();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return RemittanceResource::collection($resources);
    }

    public function store(StoreRemittanceRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $remittance = Remittance::create($validated);
        
        return new RemittanceResource($remittance);
    }

    public function show(Remittance $remittance)
    {        $this->authorize('view', $remittance);
                return new RemittanceResource($remittance);
    }

    public function update(UpdateRemittanceRequest $request, Remittance $remittance)
    {        $this->authorize('update', $remittance);
                $remittance->update($request->validated());
        
        return new RemittanceResource($remittance);
    }

    public function destroy(Remittance $remittance)
    {        $this->authorize('delete', $remittance);
                $remittance->delete();
        
        return response()->noContent();
    }
}
