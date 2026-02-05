<?php

namespace App\Http\Controllers;

use App\Models\ProductRequest;
use App\Http\Requests\StoreProductRequestRequest;
use App\Http\Requests\UpdateProductRequestRequest;
use App\Http\Resources\ProductRequestResource;
use Illuminate\Http\Request;

class ProductRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->productRequests();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return ProductRequestResource::collection($resources);
    }

    public function store(StoreProductRequestRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $productRequest = ProductRequest::create($validated);
        
        return new ProductRequestResource($productRequest);
    }

    public function show(ProductRequest $productRequest)
    {        $this->authorize('view', $productRequest);
                return new ProductRequestResource($productRequest);
    }

    public function update(UpdateProductRequestRequest $request, ProductRequest $productRequest)
    {        $this->authorize('update', $productRequest);
                $productRequest->update($request->validated());
        
        return new ProductRequestResource($productRequest);
    }

    public function destroy(ProductRequest $productRequest)
    {        $this->authorize('delete', $productRequest);
                $productRequest->delete();
        
        return response()->noContent();
    }
}
