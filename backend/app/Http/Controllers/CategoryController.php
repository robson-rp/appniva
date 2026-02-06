<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = auth()->user()->categories();
        
        // Paginação
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return CategoryResource::collection($resources);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        
        $Category = Category::create($validated);
        
        return new CategoryResource($Category);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $Category)
    {
        $this->authorize('view', $Category);
        
        return new CategoryResource($Category);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $Category)
    {
        $this->authorize('update', $Category);
        
        $Category->update($request->validated());
        
        return new CategoryResource($Category);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $Category)
    {
        $this->authorize('delete', $Category);
        
        $Category->delete();
        
        return response()->noContent();
    }
}