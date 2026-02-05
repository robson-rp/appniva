<?php

namespace App\Http\Controllers;

use App\Models\CategoryPredictionLog;
use App\Http\Requests\StoreCategoryPredictionLogRequest;
use App\Http\Requests\UpdateCategoryPredictionLogRequest;
use App\Http\Resources\CategoryPredictionLogResource;
use Illuminate\Http\Request;

class CategoryPredictionLogController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->categoryPredictionLogs();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return CategoryPredictionLogResource::collection($resources);
    }

    public function store(StoreCategoryPredictionLogRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $categoryPredictionLog = CategoryPredictionLog::create($validated);
        
        return new CategoryPredictionLogResource($categoryPredictionLog);
    }

    public function show(CategoryPredictionLog $categoryPredictionLog)
    {        $this->authorize('view', $categoryPredictionLog);
                return new CategoryPredictionLogResource($categoryPredictionLog);
    }

    public function update(UpdateCategoryPredictionLogRequest $request, CategoryPredictionLog $categoryPredictionLog)
    {        $this->authorize('update', $categoryPredictionLog);
                $categoryPredictionLog->update($request->validated());
        
        return new CategoryPredictionLogResource($categoryPredictionLog);
    }

    public function destroy(CategoryPredictionLog $categoryPredictionLog)
    {        $this->authorize('delete', $categoryPredictionLog);
                $categoryPredictionLog->delete();
        
        return response()->noContent();
    }
}
