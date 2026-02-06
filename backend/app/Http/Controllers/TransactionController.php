<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = auth()->user()->transactions();
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('account_id')) {
            $query->where('account_id', $request->account_id);
        }
        
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        if ($request->has('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }
        
        if ($request->has('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        if ($request->has('limit')) {
            $query->limit($request->limit);
        }
        
        if ($request->has('order_by')) {
            $query->orderBy($request->order_by, $request->input('order_direction', 'asc'));
        } else {
            $query->latest('date')->latest();
        }

        // Paginação
        $perPage = $request->input('per_page', 50);
        $resources = $query->paginate($perPage);
        
        return TransactionResource::collection($resources);
    }

    public function stats(Request $request)
    {
        $month = $request->input('month', now()->format('Y-m'));
        $query = auth()->user()->transactions()->where('date', 'like', "$month%");
        
        $data = $query->get();
        
        $income = $data->where('type', 'income')->sum('amount');
        $expense = $data->where('type', 'expense')->sum('amount');
        
        return response()->json([
            'data' => [
                'income' => (float)$income,
                'expense' => (float)$expense,
                'balance' => (float)($income - $expense)
            ]
        ]);
    }

    public function statsByCategory(Request $request)
    {
        $month = $request->input('month', now()->format('Y-m'));
        $type = $request->input('type', 'expense');
        
        $stats = auth()->user()->transactions()
            ->with('category:id,name,color')
            ->where('date', 'like', "$month%")
            ->where('type', $type)
            ->get()
            ->groupBy('category_id')
            ->map(function ($transactions) {
                $category = $transactions->first()->category;
                return [
                    'name' => $category ? $category->name : 'Sem categoria',
                    'color' => $category ? $category->color : '#6b7280',
                    'value' => (float)$transactions->sum('amount')
                ];
            })
            ->values();
            
        return response()->json(['data' => $stats]);
    }

    public function trends(Request $request)
    {
        $monthsCount = (int)$request->input('months', 6);
        $trends = [];
        
        for ($i = $monthsCount - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthLabel = $date->shortMonthName;
            
            $stats = auth()->user()->transactions()
                ->where('date', 'like', "$monthKey%")
                ->get();
                
            $income = $stats->where('type', 'income')->sum('amount');
            $expense = $stats->where('type', 'expense')->sum('amount');
            
            $trends[] = [
                'month' => $monthKey,
                'monthLabel' => $monthLabel,
                'income' => (float)$income,
                'expense' => (float)$expense,
                'balance' => (float)($income - $expense)
            ];
        }
        
        return response()->json(['data' => $trends]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTransactionRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        
        $Transaction = Transaction::create($validated);
        
        return new TransactionResource($Transaction);
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $Transaction)
    {
        $this->authorize('view', $Transaction);
        
        return new TransactionResource($Transaction);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTransactionRequest $request, Transaction $Transaction)
    {
        $this->authorize('update', $Transaction);
        
        $Transaction->update($request->validated());
        
        return new TransactionResource($Transaction);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $Transaction)
    {
        $this->authorize('delete', $Transaction);
        
        $Transaction->delete();
        
        return response()->noContent();
    }

    public function getTags(Transaction $transaction)
    {
        $this->authorize('view', $transaction);
        return TagResource::collection($transaction->tags);
    }

    public function addTag(Request $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);
        
        $request->validate(['tag_id' => 'required|exists:tags,id']);
        
        // Ensure user owns the tag
        $tag = auth()->user()->tags()->findOrFail($request->tag_id);
        
        $transaction->tags()->syncWithoutDetaching([$tag->id]);
        
        return response()->json(['message' => 'Tag adicionada']);
    }

    public function removeTag(Transaction $transaction, Tag $tag)
    {
        $this->authorize('update', $transaction);
        
        $transaction->tags()->detach($tag->id);
        
        return response()->json(['message' => 'Tag removida']);
    }
}