<?php

namespace App\Http\Controllers;

use App\Models\SchoolFeeTemplate;
use App\Http\Requests\StoreSchoolFeeTemplateRequest;
use App\Http\Requests\UpdateSchoolFeeTemplateRequest;
use App\Http\Resources\SchoolFeeTemplateResource;
use Illuminate\Http\Request;

class SchoolFeeTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->schoolFeeTemplates();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return SchoolFeeTemplateResource::collection($resources);
    }

    public function store(StoreSchoolFeeTemplateRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $schoolFeeTemplate = SchoolFeeTemplate::create($validated);
        
        return new SchoolFeeTemplateResource($schoolFeeTemplate);
    }

    public function show(SchoolFeeTemplate $schoolFeeTemplate)
    {        $this->authorize('view', $schoolFeeTemplate);
                return new SchoolFeeTemplateResource($schoolFeeTemplate);
    }

    public function update(UpdateSchoolFeeTemplateRequest $request, SchoolFeeTemplate $schoolFeeTemplate)
    {        $this->authorize('update', $schoolFeeTemplate);
                $schoolFeeTemplate->update($request->validated());
        
        return new SchoolFeeTemplateResource($schoolFeeTemplate);
    }

    public function destroy(SchoolFeeTemplate $schoolFeeTemplate)
    {        $this->authorize('delete', $schoolFeeTemplate);
                $schoolFeeTemplate->delete();
        
        return response()->noContent();
    }
}
