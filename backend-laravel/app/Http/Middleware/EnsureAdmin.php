<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Defense-in-depth: in addition to auth:sanctum, confirm the authenticated
 * user has the is_admin flag set. Without this, any user who somehow got a
 * Sanctum token could hit admin endpoints.
 */
class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_admin) {
            return response()->json([
                'message' => 'Forbidden — admin role required.',
            ], 403);
        }

        return $next($request);
    }
}
