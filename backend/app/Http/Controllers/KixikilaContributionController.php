<?php

namespace App\Http\Controllers;

use App\Models\KixikilaContribution;
use App\Http\Requests\StoreKixikilaContributionRequest;
use App\Http\Requests\UpdateKixikilaContributionRequest;
use App\Http\Resources\KixikilaContributionResource;
use Illuminate\Http\Request;

class KixikilaContributionController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->kixikilaContributions();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return KixikilaContributionResource::collection($resources);
    }

    public function store(StoreKixikilaContributionRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $kixikilaContribution = KixikilaContribution::create($validated);
        
        return new KixikilaContributionResource($kixikilaContribution);
    }

    public function show(KixikilaContribution $kixikilaContribution)
    {        $this->authorize('view', $kixikilaContribution);
                return new KixikilaContributionResource($kixikilaContribution);
    }

    public function update(UpdateKixikilaContributionRequest $request, KixikilaContribution $kixikilaContribution)
    {        $this->authorize('update', $kixikilaContribution);
                $kixikilaContribution->update($request->validated());
        
        return new KixikilaContributionResource($kixikilaContribution);
    }

    public function destroy(KixikilaContribution $kixikilaContribution)
    {        $this->authorize('delete', $kixikilaContribution);
                $kixikilaContribution->delete();
        
        return response()->noContent();
    }
}
