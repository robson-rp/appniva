<?php

namespace App\Http\Controllers;

use App\Models\UserMaturityProfile;
use Illuminate\Http\Request;

class UserMaturityProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $profile = UserMaturityProfile::where('user_id', $request->user()->id)->first();
        
        if (!$profile) {
            return response()->json(null);
        }

        return new \App\Http\Resources\UserMaturityProfileResource($profile);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'level' => 'required|in:basic,intermediate,advanced',
            'has_debts' => 'required|boolean',
            'has_investments' => 'required|boolean',
            'uses_budget' => 'required|boolean',
            'has_fixed_income' => 'required|boolean',
            'primary_goal' => 'nullable|string',
            'onboarding_completed' => 'boolean',
            'progress_steps_completed' => 'integer',
        ]);

        $profile = UserMaturityProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            array_merge($validated, ['user_id' => $request->user()->id])
        );

        return new \App\Http\Resources\UserMaturityProfileResource($profile);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Allow passing 'me' or the actual ID
        $profile = null;
        if ($id === 'me') {
            $profile = UserMaturityProfile::where('user_id', $request->user()->id)->firstOrFail();
        } else {
            $profile = UserMaturityProfile::findOrFail($id);
            // Basic security check
            if ($profile->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $validated = $request->validate([
            'level' => 'sometimes|in:basic,intermediate,advanced',
            'has_debts' => 'sometimes|boolean',
            'has_investments' => 'sometimes|boolean',
            'uses_budget' => 'sometimes|boolean',
            'has_fixed_income' => 'sometimes|boolean',
            'primary_goal' => 'sometimes|string',
            'onboarding_completed' => 'sometimes|boolean',
            'progress_steps_completed' => 'sometimes|integer',
        ]);

        $profile->update($validated);

        return new \App\Http\Resources\UserMaturityProfileResource($profile);
    }
}
