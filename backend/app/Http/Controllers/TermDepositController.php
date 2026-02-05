<?php

namespace App\Http\Controllers;

use App\Models\TermDeposit;
use App\Http\Requests\StoreTermDepositRequest;
use App\Http\Requests\UpdateTermDepositRequest;
use App\Http\Resources\TermDepositResource;
use Illuminate\Http\Request;

class TermDepositController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->termDeposits();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return TermDepositResource::collection($resources);
    }

    public function store(StoreTermDepositRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $termDeposit = TermDeposit::create($validated);
        
        return new TermDepositResource($termDeposit);
    }

    public function show(TermDeposit $termDeposit)
    {        $this->authorize('view', $termDeposit);
                return new TermDepositResource($termDeposit);
    }

    public function update(UpdateTermDepositRequest $request, TermDeposit $termDeposit)
    {        $this->authorize('update', $termDeposit);
                $termDeposit->update($request->validated());
        
        return new TermDepositResource($termDeposit);
    }

    public function destroy(TermDeposit $termDeposit)
    {        $this->authorize('delete', $termDeposit);
                $termDeposit->delete();
        
        return response()->noContent();
    }
}
