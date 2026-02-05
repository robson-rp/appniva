<?php

namespace App\Http\Controllers;

use App\Models\AdminAuditLog;
use App\Http\Requests\StoreAdminAuditLogRequest;
use App\Http\Requests\UpdateAdminAuditLogRequest;
use App\Http\Resources\AdminAuditLogResource;
use Illuminate\Http\Request;

class AdminAuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AdminAuditLog::query();
        
        $perPage = $request->input('per_page', 15);
        $resources = $query->paginate($perPage);
        
        return AdminAuditLogResource::collection($resources);
    }

    public function store(StoreAdminAuditLogRequest $request)
    {
        $validated = $request->validated();
                $adminAuditLog = AdminAuditLog::create($validated);
        
        return new AdminAuditLogResource($adminAuditLog);
    }

    public function show(AdminAuditLog $adminAuditLog)
    {        return new AdminAuditLogResource($adminAuditLog);
    }

    public function update(UpdateAdminAuditLogRequest $request, AdminAuditLog $adminAuditLog)
    {        $adminAuditLog->update($request->validated());
        
        return new AdminAuditLogResource($adminAuditLog);
    }

    public function destroy(AdminAuditLog $adminAuditLog)
    {        $adminAuditLog->delete();
        
        return response()->noContent();
    }
}
