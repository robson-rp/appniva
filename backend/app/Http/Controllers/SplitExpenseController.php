<?php

namespace App\Http\Controllers;

use App\Models\SplitExpense;
use App\Models\Transaction;
use App\Http\Requests\StoreSplitExpenseRequest;
use App\Http\Requests\UpdateSplitExpenseRequest;
use App\Http\Resources\SplitExpenseResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class SplitExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->splitExpenses()->with('participants');
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return SplitExpenseResource::collection($resources);
    }

    public function store(StoreSplitExpenseRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $validated = $request->validated();
            $validated['creator_id'] = auth()->id();
            $validated['share_token'] = Str::random(32);
            
            $splitExpense = SplitExpense::create($validated);

            // Create participants
            $participants = collect($request->participants)->map(function ($participant) {
                // Calculate amount_paid based on is_creator
                // If is_creator is true, they paid their share (or more effectively, they paid the whole bill initially, 
                // but in this model, amount_paid tracks repayments? 
                // In the frontend hook: amount_paid: p.is_creator ? p.amount_owed : 0
                // So creators "owe" their share and "paid" it immediately.
                $participant['amount_paid'] = $participant['is_creator'] ? $participant['amount_owed'] : 0;
                return $participant;
            });

            $splitExpense->participants()->createMany($participants);

            // Create transaction if account_id is provided
            if ($request->filled('account_id')) {
                Transaction::create([
                    'user_id' => auth()->id(),
                    'account_id' => $request->account_id,
                    'type' => 'expense',
                    'amount' => $request->total_amount,
                    'currency' => $request->currency ?? 'AOA',
                    'date' => $request->expense_date,
                    'description' => "Despesa partilhada: {$request->description}",
                ]);
            }
            
            return new SplitExpenseResource($splitExpense->load('participants'));
        });
    }

    public function stats(Request $request)
    {
        $expenses = auth()->user()->splitExpenses()->with('participants')->get();
        
        $totalOwed = $expenses->where('is_settled', false)->sum(function ($expense) {
            return $expense->participants
                ->where('is_creator', false)
                ->sum(fn($p) => $p->amount_owed - $p->amount_paid);
        });

        $totalSettled = $expenses->where('is_settled', true)->sum('total_amount');
        $activeExpenses = $expenses->where('is_settled', false)->count();

        return response()->json([
            'data' => [
                'totalOwed' => (float) $totalOwed,
                'totalSettled' => (float) $totalSettled,
                'activeExpenses' => $activeExpenses,
                'totalExpenses' => $expenses->count()
            ]
        ]);
    }

    public function uploadReceipt(Request $request, SplitExpense $splitExpense)
    {
        if ($splitExpense->creator_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB
        ]);

        $file = $request->file('file');
        $path = $file->storePublicly("receipts/{$splitExpense->id}", 'public'); // Requires storage link
        
        // Build public URL
        $url = Storage::url($path);
        // If usng S3 or similar, url() works. If strictly local, ensure symbolioc link (php artisan storage:link)

        $splitExpense->update(['receipt_url' => $url]);

        return response()->json(['url' => $url]);
    }

    public function show(SplitExpense $splitExpense)
    {
        if ($splitExpense->creator_id !== auth()->id()) {
            abort(403);
        }
        return new SplitExpenseResource($splitExpense);
    }

    public function update(UpdateSplitExpenseRequest $request, SplitExpense $splitExpense)
    {
        if ($splitExpense->creator_id !== auth()->id()) {
            abort(403);
        }
        $splitExpense->update($request->validated());
        
        return new SplitExpenseResource($splitExpense);
    }

    public function destroy(SplitExpense $splitExpense)
    {
        if ($splitExpense->creator_id !== auth()->id()) {
            abort(403);
        }
        $splitExpense->delete();
        
        return response()->noContent();
    }
}
