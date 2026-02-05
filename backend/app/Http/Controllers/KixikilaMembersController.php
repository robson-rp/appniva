<?php

namespace App\Http\Controllers;

use App\Models\KixikilaMembers;
use App\Http\Requests\StoreKixikilaMembersRequest;
use App\Http\Requests\UpdateKixikilaMembersRequest;
use App\Http\Resources\KixikilaMembersResource;
use Illuminate\Http\Request;

class KixikilaMembersController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->kixikilaMembers();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return KixikilaMembersResource::collection($resources);
    }

    public function store(StoreKixikilaMembersRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $kixikilaMembers = KixikilaMembers::create($validated);
        
        return new KixikilaMembersResource($kixikilaMembers);
    }

    public function show(KixikilaMembers $kixikilaMembers)
    {        $this->authorize('view', $kixikilaMembers);
                return new KixikilaMembersResource($kixikilaMembers);
    }

    public function update(UpdateKixikilaMembersRequest $request, KixikilaMembers $kixikilaMembers)
    {        $this->authorize('update', $kixikilaMembers);
                $kixikilaMembers->update($request->validated());
        
        return new KixikilaMembersResource($kixikilaMembers);
    }

    public function destroy(KixikilaMembers $kixikilaMembers)
    {        $this->authorize('delete', $kixikilaMembers);
                $kixikilaMembers->delete();
        
        return response()->noContent();
    }
}
