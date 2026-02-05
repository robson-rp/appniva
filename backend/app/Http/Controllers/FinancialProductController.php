<?php

namespace App\Http\Controllers;

use App\Models\FinancialProduct;
use App\Http\Requests\StoreFinancialProductRequest;
use App\Http\Requests\UpdateFinancialProductRequest;
use App\Http\Resources\FinancialProductResource;
use Illuminate\Http\Request;

class FinancialProductController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->financialProducts();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return FinancialProductResource::collection($resources);
    }

    public function store(StoreFinancialProductRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $financialProduct = FinancialProduct::create($validated);
        
        return new FinancialProductResource($financialProduct);
    }

    public function show(FinancialProduct $financialProduct)
    {        $this->authorize('view', $financialProduct);
                return new FinancialProductResource($financialProduct);
    }

    public function update(UpdateFinancialProductRequest $request, FinancialProduct $financialProduct)
    {        $this->authorize('update', $financialProduct);
                $financialProduct->update($request->validated());
        
        return new FinancialProductResource($financialProduct);
    }

    public function destroy(FinancialProduct $financialProduct)
    {        $this->authorize('delete', $financialProduct);
                $financialProduct->delete();
        
        return response()->noContent();
    }
}
