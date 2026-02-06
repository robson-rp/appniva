<?php

namespace App\Http\Controllers;

use App\Models\Kixikila;
use App\Http\Requests\StoreKixikilaRequest;
use App\Http\Requests\UpdateKixikilaRequest;
use App\Http\Resources\KixikilaResource;
use Illuminate\Http\Request;

class KixikilaController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->kixikilas();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return KixikilaResource::collection($resources);
    }

    public function store(StoreKixikilaRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        $kixikila = Kixikila::create($validated);
        
        return new KixikilaResource($kixikila);
    }

    public function show(Kixikila $kixikila)
    {        $this->authorize('view', $kixikila);
                return new KixikilaResource($kixikila);
    }

    public function update(UpdateKixikilaRequest $request, Kixikila $kixikila)
    {        $this->authorize('update', $kixikila);
                $kixikila->update($request->validated());
        
        return new KixikilaResource($kixikila);
    }

    public function destroy(Kixikila $kixikila)
    {        $this->authorize('delete', $kixikila);
                $kixikila->delete();
        
        return response()->noContent();
    }
}
