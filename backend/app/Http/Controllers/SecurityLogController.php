<?php

namespace App\Http\Controllers;

use App\Models\SecurityLog;
use App\Http\Requests\StoreSecurityLogRequest;
use App\Http\Requests\UpdateSecurityLogRequest;
use App\Http\Resources\SecurityLogResource;
use Illuminate\Http\Request;

class SecurityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->securityLogs();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return SecurityLogResource::collection($resources);
    }

    public function store(StoreSecurityLogRequest $request)
    {
        $validated = $request->validated();
                $validated['user_id'] = auth()->id();
                $securityLog = SecurityLog::create($validated);
        
        return new SecurityLogResource($securityLog);
    }

    public function show(SecurityLog $securityLog)
    {        $this->authorize('view', $securityLog);
                return new SecurityLogResource($securityLog);
    }

    public function update(UpdateSecurityLogRequest $request, SecurityLog $securityLog)
    {        $this->authorize('update', $securityLog);
                $securityLog->update($request->validated());
        
        return new SecurityLogResource($securityLog);
    }

    public function destroy(SecurityLog $securityLog)
    {        $this->authorize('delete', $securityLog);
                $securityLog->delete();
        
        return response()->noContent();
    }
}
