<?php

namespace App\Http\Controllers;

use App\Models\SchoolFee;
use App\Http\Requests\StoreSchoolFeeRequest;
use App\Http\Requests\UpdateSchoolFeeRequest;
use App\Http\Resources\SchoolFeeResource;
use Illuminate\Http\Request;

class SchoolFeeController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->schoolFees();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return SchoolFeeResource::collection($resources);
    }

    public function store(StoreSchoolFeeRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $schoolFee = SchoolFee::create($validated);
        
        return new SchoolFeeResource($schoolFee);
    }

    public function show(SchoolFee $schoolFee)
    {        $this->authorize('view', $schoolFee);
                return new SchoolFeeResource($schoolFee);
    }

    public function update(UpdateSchoolFeeRequest $request, SchoolFee $schoolFee)
    {        $this->authorize('update', $schoolFee);
                $schoolFee->update($request->validated());
        
        return new SchoolFeeResource($schoolFee);
    }

    public function destroy(SchoolFee $schoolFee)
    {        $this->authorize('delete', $schoolFee);
                $schoolFee->delete();
        
        return response()->noContent();
    }
}
