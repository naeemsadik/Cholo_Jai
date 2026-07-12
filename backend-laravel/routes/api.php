<?php

use App\Http\Controllers\Admin\AnalyticsController as AdminAnalyticsController;
use App\Http\Controllers\Admin\CmsHomeController as AdminCmsHomeController;
use App\Http\Controllers\Admin\CmsPageController as AdminCmsPageController;
use App\Http\Controllers\Admin\EventController as AdminEventController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\SubmissionController as AdminSubmissionController;
use App\Http\Controllers\Admin\UploadController as AdminUploadController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Public\AnalyticsController as PublicAnalyticsController;
use App\Http\Controllers\Public\CmsPageController as PublicCmsPageController;
use App\Http\Controllers\Public\EventController as PublicEventController;
use App\Http\Controllers\Public\LookupController;
use App\Http\Controllers\Public\SubmissionController as PublicSubmissionController;
use App\Http\Controllers\Public\SubscriberController as PublicSubscriberController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API routes — Cholo Jai Laravel backend
|--------------------------------------------------------------------------
|
| Registered with apiPrefix='' so paths like `/events`, `/admin/login`, and
| `/analytics/pageview` match the live frontend contract verbatim.
|
*/

// ─── Analytics (fire-and-forget, 600/min per IP) ───
Route::middleware('throttle:analytics')->group(function () {
    Route::post('/analytics/pageview', [PublicAnalyticsController::class, 'pageview']);
    Route::post('/analytics/outbound-click', [PublicAnalyticsController::class, 'outboundClick']);
    Route::post('/analytics/event', [PublicAnalyticsController::class, 'event']);
});

// ─── Public writes (rate-limited) ───
Route::middleware('throttle:submission')->group(function () {
    Route::post('/submissions', [PublicSubmissionController::class, 'store']);
    Route::post('/subscribers', [PublicSubscriberController::class, 'store']);
});

// ─── Public reads ───
Route::get('/events', [PublicEventController::class, 'index']);
Route::get('/events/hero', [PublicEventController::class, 'hero']);
Route::get('/events/{slug}', [PublicEventController::class, 'show']);
Route::get('/lookups', [LookupController::class, 'index']);
Route::get('/cms/home', [AdminCmsHomeController::class, 'show']);
Route::get('/cms/pages', [PublicCmsPageController::class, 'index']);
Route::get('/cms/pages/{id}', [PublicCmsPageController::class, 'show'])->whereNumber('id');

// ─── Admin auth ───
Route::post('/admin/login', [LoginController::class, 'login'])->middleware('throttle:login');

// ─── Admin routes (auth:sanctum + ensure.admin) ───
Route::middleware(['auth:sanctum', 'ensure.admin'])->prefix('admin')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);

    Route::get('/events', [AdminEventController::class, 'index']);
    Route::post('/events', [AdminEventController::class, 'store']);
    Route::get('/events/{event}', [AdminEventController::class, 'show'])->whereNumber('event');
    Route::match(['put', 'patch'], '/events/{event}', [AdminEventController::class, 'update'])->whereNumber('event');
    Route::delete('/events/{event}', [AdminEventController::class, 'destroy'])->whereNumber('event');
    Route::patch('/events/{event}/status', [AdminEventController::class, 'updateStatus'])->whereNumber('event');

    Route::get('/submissions', [AdminSubmissionController::class, 'index']);
    Route::match(['put', 'patch'], '/submissions/{submission}', [AdminSubmissionController::class, 'update'])->whereNumber('submission');
    Route::patch('/submissions/{submission}/review', [AdminSubmissionController::class, 'review'])->whereNumber('submission');

    Route::get('/analytics/summary', [AdminAnalyticsController::class, 'summary']);

    Route::post('/uploads', [AdminUploadController::class, 'store']);
});

// ─── Admin-only singleton endpoints under /api/* ───
Route::middleware(['auth:sanctum', 'ensure.admin'])->prefix('api')->group(function () {
    Route::get('/settings', [AdminSettingsController::class, 'show']);
    Route::put('/settings', [AdminSettingsController::class, 'update']);

    Route::get('/cms/home', [AdminCmsHomeController::class, 'show']);
    Route::put('/cms/home', [AdminCmsHomeController::class, 'update']);

    Route::get('/cms/pages', [AdminCmsPageController::class, 'index']);
    Route::get('/cms/pages/{cmsPage}', [AdminCmsPageController::class, 'show'])->whereNumber('cmsPage');
    Route::put('/cms/pages/{cmsPage}', [AdminCmsPageController::class, 'update'])->whereNumber('cmsPage');
});
