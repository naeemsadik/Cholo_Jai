<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->registerRateLimiters();
        $this->warnIfProdWithoutHttps();
    }

    /**
     * Per-plan §15 — analytics events must never be skipped, but they must
     * also be cheap. Login must be heavily throttled. Submissions get a
     * generous spam guard.
     */
    private function registerRateLimiters(): void
    {
        RateLimiter::for('analytics', function (Request $request) {
            return Limit::perMinute(600)->by($request->ip());
        });

        RateLimiter::for('login', function (Request $request) {
            // Throttle by IP + email so a credential-stuffing attempt on one
            // account from a botnet doesn't burn the budget for legit users on
            // that same IP, and vice versa.
            $email = (string) $request->input('email', '');
            return Limit::perMinute(5)->by($request->ip().'|'.strtolower($email));
        });

        RateLimiter::for('submission', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        RateLimiter::for('admin-write', function (Request $request) {
            return Limit::perMinute(120)->by(
                $request->user()?->id ?? $request->ip()
            );
        });
    }

    /**
     * Per plan §17 — log a warning in production if APP_URL is not HTTPS.
     * Cheap sanity check; can be wired to Sentry/PagerDuty later.
     */
    private function warnIfProdWithoutHttps(): void
    {
        if (! app()->environment('production')) {
            return;
        }

        $url = (string) config('app.url');
        if ($url !== '' && ! str_starts_with($url, 'https://')) {
            logger()->warning('APP_URL is not HTTPS in production', [
                'app_url' => $url,
            ]);
        }
    }
}
