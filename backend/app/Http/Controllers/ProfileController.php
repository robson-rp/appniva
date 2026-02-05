<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Http\Requests\StoreProfileRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\ProfileResource;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = auth()->user()->Profiles();
        
        // Paginação
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return ProfileResource::collection($resources);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProfileRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        
        $Profile = Profile::create($validated);
        
        return new ProfileResource($Profile);
    }

    /**
     * Display the specified resource.
     */
    public function show(Profile $Profile)
    {
        $this->authorize('view', $Profile);
        
        return new ProfileResource($Profile);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProfileRequest $request, Profile $Profile)
    {
        $this->authorize('update', $Profile);
        
        $Profile->update($request->validated());
        
        return new ProfileResource($Profile);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Profile $Profile)
    {
        $this->authorize('delete', $Profile);
        
        $Profile->delete();
        
        return response()->noContent();
    }
}