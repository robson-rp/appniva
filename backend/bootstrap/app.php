<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Configure API rate limiting
        $middleware->api(prepend: [
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);

        // Define custom throttle aliases
        $middleware->alias([
            'throttle.auth' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':auth',
            'throttle.mutations' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':mutations',
            'audit' => \App\Http\Middleware\AuditLogMiddleware::class,
        ]);

        // Configure CORS for frontend access
        $middleware->statefulApi();

        // Allow frontend domain in production
        $middleware->validateCsrfTokens(except: [
            'api/*', // Sanctum uses token auth, not CSRF
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->booting(function () {
        // Global API rate limit: 1000 requests per minute per user (Relaxed for dev)
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(1000)->by($request->user()?->id ?: $request->ip());
        });

        // Auth routes: 100 login attempts per minute
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(100)->by($request->ip());
        });

        // Mutation routes (POST/PUT/DELETE): 500 per minute to prevent abuse
        RateLimiter::for('mutations', function (Request $request) {
            return Limit::perMinute(500)->by($request->user()?->id ?: $request->ip());
        });

        // Financial operations: relaxed limit (500 per minute)
        RateLimiter::for('financial', function (Request $request) {
            return Limit::perMinute(500)->by($request->user()?->id ?: $request->ip());
        });

        // OCR/AI operations: relaxed (100 per minute - expensive operations)
        RateLimiter::for('ai', function (Request $request) {
            return Limit::perMinute(100)->by($request->user()?->id ?: $request->ip());
        });
    })
    ->create();
