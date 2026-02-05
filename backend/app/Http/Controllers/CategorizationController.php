<?php

namespace App\Http\Controllers;

use App\Services\CategorizationService;
use App\Models\Transaction;
use Illuminate\Http\Request;

class CategorizationController extends Controller
{
    public function __construct(
        protected CategorizationService $categorizationService
    ) {}

    /**
     * Predict category for transaction description
     */
    public function predict(Request $request)
    {
        $request->validate([
            'description' => 'required|string|min:3',
        ]);

        $prediction = $this->categorizationService->predictCategory(
            $request->description,
            auth()->id()
        );

        if (!$prediction) {
            return response()->json([
                'prediction' => null,
                'message' => 'No category prediction available',
            ]);
        }

        return response()->json([
            'prediction' => $prediction,
        ]);
    }

    /**
     * Auto-categorize single transaction
     */
    public function categorize(Request $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);

        $success = $this->categorizationService->autoCategorize($transaction);

        return response()->json([
            'success' => $success,
            'transaction' => $transaction->fresh(),
        ]);
    }

    /**
     * Batch categorize uncategorized transactions
     */
    public function batchCategorize(Request $request)
    {
        $request->validate([
            'limit' => 'nullable|integer|min:1|max:500',
        ]);

        $result = $this->categorizationService->batchCategorize(
            auth()->id(),
            $request->input('limit', 100)
        );

        return response()->json($result);
    }

    /**
     * Log user feedback on prediction
     */
    public function feedback(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'predicted_category_id' => 'required|exists:categories,id',
            'was_accepted' => 'required|boolean',
            'feedback' => 'nullable|string|max:500',
        ]);

        $this->categorizationService->logFeedback(
            $request->transaction_id,
            $request->predicted_category_id,
            $request->was_accepted,
            $request->feedback
        );

        return response()->json([
            'success' => true,
            'message' => 'Feedback recorded successfully',
        ]);
    }

    /**
     * Get categorization statistics
     */
    public function stats()
    {
        $stats = $this->categorizationService->getStats(auth()->id());

        return response()->json($stats);
    }
}
