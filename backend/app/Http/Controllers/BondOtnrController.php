<?php

namespace App\Http\Controllers;

use App\Models\BondOtnr;
use App\Http\Requests\StoreBondOtnrRequest;
use App\Http\Requests\UpdateBondOtnrRequest;
use App\Http\Resources\BondOtnrResource;
use Illuminate\Http\Request;

class BondOtnrController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->bondOtnrs();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return BondOtnrResource::collection($resources);
    }

    public function store(StoreBondOtnrRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $bondOtnr = BondOtnr::create($validated);
        
        return new BondOtnrResource($bondOtnr);
    }

    public function show(BondOtnr $bondOtnr)
    {        $this->authorize('view', $bondOtnr);
                return new BondOtnrResource($bondOtnr);
    }

    public function update(UpdateBondOtnrRequest $request, BondOtnr $bondOtnr)
    {        $this->authorize('update', $bondOtnr);
                $bondOtnr->update($request->validated());
        
        return new BondOtnrResource($bondOtnr);
    }

    public function destroy(BondOtnr $bondOtnr)
    {        $this->authorize('delete', $bondOtnr);
                $bondOtnr->delete();
        
        return response()->noContent();
    }
}
