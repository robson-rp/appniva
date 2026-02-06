<?php

namespace App\Http\Controllers;

use App\Models\KixikilaContribution;
use App\Models\Transaction;
use App\Models\Kixikila;
use App\Http\Requests\StoreKixikilaContributionRequest;
use App\Http\Requests\UpdateKixikilaContributionRequest;
use App\Http\Resources\KixikilaContributionResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KixikilaContributionController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->kixikilaContributions();
        
        if ($request->has('kixikila_id')) {
            $query->where('kixikila_id', $request->kixikila_id);
        }

        if ($request->has('order_by')) {
            $query->orderBy($request->order_by, $request->input('order_direction', 'asc'));
        } else {
            $query->latest('paid_at');
        }
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return KixikilaContributionResource::collection($resources);
    }

    public function store(StoreKixikilaContributionRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $validated = $request->validated();
            
            $contribution = KixikilaContribution::create($validated);

            // Create transaction if account_id is provided
            if ($request->filled('account_id')) {
                $kixikila = Kixikila::find($request->kixikila_id);
                Transaction::create([
                    'user_id' => auth()->id(),
                    'account_id' => $request->account_id,
                    'type' => $request->transaction_type ?? 'expense',
                    'amount' => $request->amount,
                    'currency' => $kixikila->currency ?? 'AOA',
                    'date' => $request->paid_at,
                    'description' => "Kixikila: {$kixikila->name} - Rodada {$request->round_number}",
                    'source' => 'kixikila',
                ]);
            }
            
            return new KixikilaContributionResource($contribution);
        });
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
