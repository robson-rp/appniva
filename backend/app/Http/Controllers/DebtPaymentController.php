<?php

namespace App\Http\Controllers;

use App\Models\DebtPayment;
use App\Http\Requests\StoreDebtPaymentRequest;
use App\Http\Requests\UpdateDebtPaymentRequest;
use App\Http\Resources\DebtPaymentResource;
use Illuminate\Http\Request;

class DebtPaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->debtPayments();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return DebtPaymentResource::collection($resources);
    }

    public function store(StoreDebtPaymentRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $debtPayment = DebtPayment::create($validated);
        
        return new DebtPaymentResource($debtPayment);
    }

    public function show(DebtPayment $debtPayment)
    {        $this->authorize('view', $debtPayment);
                return new DebtPaymentResource($debtPayment);
    }

    public function update(UpdateDebtPaymentRequest $request, DebtPayment $debtPayment)
    {        $this->authorize('update', $debtPayment);
                $debtPayment->update($request->validated());
        
        return new DebtPaymentResource($debtPayment);
    }

    public function destroy(DebtPayment $debtPayment)
    {        $this->authorize('delete', $debtPayment);
                $debtPayment->delete();
        
        return response()->noContent();
    }
}
