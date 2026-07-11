<?php

use App\Http\Middleware\EnsureAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        // No /api prefix — frontend hits /events, /admin/login, etc. directly.
        apiPrefix: '',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'ensure.admin' => EnsureAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Return JSON for any non-browser request (curl, fetch, etc.).
        // The simple check is "do they accept JSON OR is the path API-ish?" —
        // since we removed /api prefix, route-name matching is what we use.
        $exceptions->shouldRenderJsonWhen(function (Request $request) {
            if ($request->wantsJson()) {
                return true;
            }
            $accept = (string) $request->header('Accept', '');
            return str_contains($accept, 'application/json');
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->wantsJson() || str_contains((string) $request->header('Accept'), 'application/json')) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->wantsJson() || str_contains((string) $request->header('Accept'), 'application/json')) {
                return response()->json(['message' => 'Not found.'], 404);
            }
        });
    })->create();
