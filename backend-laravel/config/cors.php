<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS — Cholo Jai Laravel backend
    |--------------------------------------------------------------------------
    |
    | With apiPrefix='' set in bootstrap/app.php, all endpoints live at the
    | root path (e.g. /events). We want CORS to apply to every route so the
    | frontend at http://localhost:3000 can hit any of them. For production,
    | FRONTEND_ORIGIN is set to the deployed URL.
    |
    */

    'paths' => ['*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_ORIGIN', 'http://localhost:3000'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    // The analytics client (X-Ghurighuri-Session) reads this header in JS,
    // but exposed_headers is mostly informational. Kept explicit.
    'exposed_headers' => ['X-Ghurighuri-Session'],

    'max_age' => 0,

    // Bearer tokens only — no cookies — so credentials stay off.
    'supports_credentials' => false,

];
