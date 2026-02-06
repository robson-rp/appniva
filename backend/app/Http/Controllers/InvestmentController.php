<?php

namespace App\Http\Controllers;

use App\Http\Resources\InvestmentResource;
use App\Models\Investment;
use App\Models\TermDeposit;
use App\Models\BondOtnr;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvestmentController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->investments();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return InvestmentResource::collection($resources);
    }

    public function store(StoreInvestmentRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $validated = $request->validated();
            $validated['user_id'] = auth()->id();
            
            $investment = Investment::create($validated);

            if ($request->investment_type === 'term_deposit' && $request->has('term_deposit')) {
                $investment->termDeposits()->create($request->term_deposit);
            }

            if (($request->investment_type === 'bond_otnr' || $request->investment_type === 'bond') && $request->has('bond_otnr')) {
                $investment->bondOtnrs()->create($request->bond_otnr);
            }

            // Create automatic transaction if account_id is provided
            if ($request->filled('account_id')) {
                Transaction::create([
                    'user_id' => auth()->id(),
                    'account_id' => $request->account_id,
                    'amount' => $request->principal_amount,
                    'type' => 'expense',
                    'description' => "Investimento: {$request->name}",
                    'date' => $request->start_date,
                    'currency' => $request->currency ?? 'AOA',
                    'source' => 'investment',
                ]);
            }

            return new InvestmentResource($investment->load(['termDeposits', 'bondOtnrs']));
        });
    }

    public function stats(Request $request)
    {
        $investments = auth()->user()->investments()->get();
        
        $total = $investments->sum('principal_amount');
        $byType = $investments->groupBy('investment_type')
            ->map(fn($group) => $group->sum('principal_amount'));
            
        return response()->json([
            'data' => [
                'total' => (float) $total,
                'byType' => $byType
            ]
        ]);
    }

    public function show(Investment $investment)
    {        $this->authorize('view', $investment);
                return new InvestmentResource($investment);
    }

    public function update(UpdateInvestmentRequest $request, Investment $investment)
    {        $this->authorize('update', $investment);
                $investment->update($request->validated());
        
        return new InvestmentResource($investment);
    }

    public function destroy(Investment $investment)
    {        $this->authorize('delete', $investment);
                $investment->delete();
        
        return response()->noContent();
    }
}
