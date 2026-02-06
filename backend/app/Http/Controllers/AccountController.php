<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use App\Http\Resources\AccountResource;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = auth()->user()->accounts();
        
        // Paginação
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return AccountResource::collection($resources);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAccountRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        
        $Account = Account::create($validated);
        
        return new AccountResource($Account);
    }

    /**
     * Display the specified resource.
     */
    public function show(Account $Account)
    {
        $this->authorize('view', $Account);
        
        return new AccountResource($Account);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAccountRequest $request, Account $Account)
    {
        $this->authorize('update', $Account);
        
        $Account->update($request->validated());
        
        return new AccountResource($Account);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Account $Account)
    {
        $this->authorize('delete', $Account);
        
        $Account->delete();
        
        return response()->noContent();
    }
}