<?php

namespace App\Http\Controllers;

use App\Models\SplitExpenseParticipant;
use App\Models\SplitExpensePaymentHistory;
use App\Http\Requests\StoreSplitExpenseParticipantRequest;
use App\Http\Requests\UpdateSplitExpenseParticipantRequest;
use App\Http\Resources\SplitExpenseParticipantResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SplitExpenseParticipantController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->splitExpenseParticipants();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return SplitExpenseParticipantResource::collection($resources);
    }

    public function store(StoreSplitExpenseParticipantRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $splitExpenseParticipant = SplitExpenseParticipant::create($validated);
        
        return new SplitExpenseParticipantResource($splitExpenseParticipant);
    }

    public function show(SplitExpenseParticipant $splitExpenseParticipant)
    {        $this->authorize('view', $splitExpenseParticipant);
                return new SplitExpenseParticipantResource($splitExpenseParticipant);
    }

    public function update(UpdateSplitExpenseParticipantRequest $request, SplitExpenseParticipant $splitExpenseParticipant)
    {        $this->authorize('update', $splitExpenseParticipant);
                $splitExpenseParticipant->update($request->validated());
        
        return new SplitExpenseParticipantResource($splitExpenseParticipant);
    }

    public function destroy(SplitExpenseParticipant $splitExpenseParticipant)
    {
        $this->authorize('delete', $splitExpenseParticipant);
        
        $splitExpenseParticipant->delete();
        
        return response()->noContent();
    }

    public function recordPayment(Request $request, SplitExpenseParticipant $participant)
    {
        // Add authorization check here if needed (e.g. only creator or the participant themselves?)
        // Assuming creator records payments or user records their own?
        // For now, let's assume basic auth or check relation to expense creator
        
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        if ($participant->is_creator) {
            return response()->json(['message' => 'O criador já pagou a conta.'], 400);
        }

        $remaining = $participant->amount_owed - $participant->amount_paid;

        if ($remaining <= 0) {
            return response()->json(['message' => 'Este participante já pagou o valor total.'], 400);
        }

        $amountToPay = min($request->amount, $remaining);

        DB::transaction(function () use ($participant, $amountToPay) {
            $participant->increment('amount_paid', $amountToPay);

            SplitExpensePaymentHistory::create([
                'participant_id' => $participant->id,
                'amount' => $amountToPay,
            ]);
        });

        return response()->json([
            'actualAmount' => (float) $amountToPay,
            'remaining' => (float) ($remaining - $amountToPay),
            'participant' => new SplitExpenseParticipantResource($participant->refresh())
        ]);
    }
}
