<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AdminAuditLog;

class AuditLogMiddleware
{
    /**
     * Actions that should be audited
     */
    protected array $auditableActions = [
        'POST',    // Create operations
        'PUT',     // Full update operations
        'PATCH',   // Partial update operations
        'DELETE',  // Delete operations
    ];

    /**
     * Routes that should be excluded from audit logging
     */
    protected array $excludedRoutes = [
        'api/security-logs',
        'api/admin-audit-logs',
        'api/category-prediction-logs',
        'api/uploaded-documents',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only audit specific HTTP methods
        if (!in_array($request->method(), $this->auditableActions)) {
            return $response;
        }

        // Skip excluded routes
        if ($this->shouldExcludeRoute($request)) {
            return $response;
        }

        // Only log successful operations (2xx status codes)
        if ($response->getStatusCode() < 200 || $response->getStatusCode() >= 300) {
            return $response;
        }

        // Create audit log entry
        $this->createAuditLog($request, $response);

        return $response;
    }

    /**
     * Check if the route should be excluded from audit logging
     */
    protected function shouldExcludeRoute(Request $request): bool
    {
        $path = $request->path();

        foreach ($this->excludedRoutes as $excludedRoute) {
            if (str_starts_with($path, $excludedRoute)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Create an audit log entry
     */
    protected function createAuditLog(Request $request, Response $response): void
    {
        try {
            $user = $request->user();

            // Extract resource information
            $resourceType = $this->extractResourceType($request);
            $resourceId = $this->extractResourceId($request, $response);

            AdminAuditLog::create([
                'user_id' => $user?->id,
                'action' => $this->getActionName($request),
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'changes' => $this->extractChanges($request),
                'metadata' => [
                    'method' => $request->method(),
                    'path' => $request->path(),
                    'status' => $response->getStatusCode(),
                ],
            ]);
        } catch (\Exception $e) {
            // Fail silently - don't break the request if audit logging fails
            \Log::error('Audit logging failed: ' . $e->getMessage());
        }
    }

    /**
     * Get a human-readable action name
     */
    protected function getActionName(Request $request): string
    {
        return match($request->method()) {
            'POST' => 'create',
            'PUT', 'PATCH' => 'update',
            'DELETE' => 'delete',
            default => 'unknown',
        };
    }

    /**
     * Extract resource type from the request path
     */
    protected function extractResourceType(Request $request): ?string
    {
        $path = $request->path();

        // Remove 'api/' prefix
        $path = str_replace('api/', '', $path);

        // Extract the first segment as resource type
        $segments = explode('/', $path);

        return $segments[0] ?? null;
    }

    /**
     * Extract resource ID from request or response
     */
    protected function extractResourceId(Request $request, Response $response): ?int
    {
        // Try to get ID from route parameter
        $id = $request->route('id')
            ?? $request->route('profile')
            ?? $request->route('account')
            ?? $request->route('transaction')
            ?? $request->route('goal')
            ?? $request->route('debt')
            ?? $request->route('budget');

        if ($id) {
            return is_numeric($id) ? (int)$id : null;
        }

        // For POST requests, try to extract ID from response
        if ($request->method() === 'POST' && $response instanceof \Illuminate\Http\JsonResponse) {
            $data = $response->getData(true);
            return $data['data']['id'] ?? $data['id'] ?? null;
        }

        return null;
    }

    /**
     * Extract changes from the request payload
     */
    protected function extractChanges(Request $request): ?array
    {
        $payload = $request->all();

        // Remove sensitive fields
        $sensitiveFields = ['password', 'password_confirmation', 'token', 'secret'];
        foreach ($sensitiveFields as $field) {
            if (isset($payload[$field])) {
                $payload[$field] = '[REDACTED]';
            }
        }

        return $payload ?: null;
    }
}
