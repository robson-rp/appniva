<?php

namespace App\Http\Controllers;

use App\Models\UserMobilePreference;
use Illuminate\Http\Request;

class UserMobilePreferenceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $preference = UserMobilePreference::where('user_id', $request->user()->id)->first();
        return response()->json(['data' => $preference]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'selected_features' => 'required|array',
            'selected_features.*' => 'string',
        ]);

        $preference = UserMobilePreference::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['selected_features' => $request->selected_features]
        );

        return response()->json(['data' => $preference]);
    }

    /**
     * Display the specified resource.
     */
    public function show(UserMobilePreference $userMobilePreference)
    {
        if ($userMobilePreference->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json(['data' => $userMobilePreference]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserMobilePreference $userMobilePreference)
    {
        if ($userMobilePreference->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'selected_features' => 'sometimes|array',
            'selected_features.*' => 'string',
        ]);

        $userMobilePreference->update($request->only('selected_features'));

        return response()->json(['data' => $userMobilePreference]);
    }
}
