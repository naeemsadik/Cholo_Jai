<?php

use Dedoc\Scramble\SecurityDocumentation\MiddlewareAuthSecurityStrategy;
use Dedoc\Scramble\Support\Generator\SecurityScheme;

return [
    /*
     * Because the frontend hits bare paths (`/events`, `/admin/login`,
     * `/admin/events`), not `/api/...`, set api_path to an array form
     * so we include everything in `routes/api.php` while excluding
     * the Sanctum CSRF cookie endpoint (which isn't a real API surface).
     */
    'api_path' => [
        'include' => '',
        'exclude' => ['sanctum/csrf-cookie'],
    ],

    /*
     * Don't pick up unintended hosts. Leave null to use APP_URL.
     */
    'api_domain' => null,

    'export_path' => 'api.json',

    'cache' => [
        'key' => 'scramble.openapi',
        'store' => 'file',
    ],

    'info' => [
        // API_VERSION drives the OpenAPI `info.version` field. Bumping it
        // signals contract changes to API consumers (also: the Next.js
        // frontend test scripts key off it).
        'version' => env('API_VERSION', '0.1.0'),

        'description' => <<<MD
        Cholo Jai — Curated event discovery for Dhaka.

        - **Public reads** (`/events`, `/lookups`, `/submissions`,
          `/subscribers`, `/analytics/*`) require no authentication.
        - **Admin reads/writes** (`/admin/*`, `/api/*`) require a Sanctum
          bearer token issued by `POST /admin/login`. Use the green
          **Authorize** button at the top right to paste one in.

        Built with Laravel 11 + MySQL 8.0. Frontend lives at the
        `FRONTEND_ORIGIN` set in `.env`.
        MD,
    ],

    'ui' => [
        'title' => 'Cholo Jai API',
    ],

    'renderer' => 'elements', // Stoplight Elements — Swagger-like UI bundled into the app

    'renderers' => [
        'elements' => [
            'view' => 'scramble::docs',
            'theme' => 'light',
            'hideTryIt' => false,
            'hideSchemas' => false,
            'logo' => '',
            'tryItCredentialsPolicy' => 'include',
            'layout' => 'responsive',
            'router' => 'hash',
        ],
        'scalar' => [
            'view' => 'scramble::scalar',
            'cdn' => 'https://cdn.jsdelivr.net/npm/@scalar/api-reference',
            'theme' => 'laravel',
            'proxyUrl' => 'https://proxy.scalar.com',
            'darkMode' => false,
            'showDeveloperTools' => 'never',
            'agent' => ['disabled' => true],
            'credentials' => 'include',
        ],
    ],

    /*
     * Two servers to make "Try it" requests useful. Scramble expects
     * `servers` as a map of [name => url] (the description text is not
     * supported in this format).
     */
    'servers' => [
        'Live' => env('PUBLIC_API_URL', env('APP_URL', 'http://localhost:8000')),
        'Local' => 'http://localhost:8000',
    ],

    'enum_cases_description_strategy' => 'description',
    'enum_cases_names_strategy' => false,

    'flatten_deep_query_parameters' => true,

    'middleware' => [
        'web',
    ],

    'extensions' => [],

    /*
     * Detect Sanctum bearer-token auth on routes that use
     * `auth:sanctum`. Routes without that middleware show up as public
     * (security: []). This is what makes the "Authorize" button work.
     */
    'security_strategy' => [
        MiddlewareAuthSecurityStrategy::class,
        [
            'middleware' => ['auth:sanctum', 'auth:api'],
            'scheme' => SecurityScheme::http('bearer', 'sanctum', 'Use POST /admin/login to get a token.'),
        ],
    ],
];
