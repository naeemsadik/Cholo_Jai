<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventTrackingRequest;
use App\Http\Requests\OutboundClickRequest;
use App\Http\Requests\PageviewRequest;
use App\Models\AnalyticsEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Per plan §11 / PUKU.local.md — analytics endpoints must be cheap, fire-and-
 * forget, and NEVER skipped. All three return 204 No Content.
 *
 * Each endpoint also reads the X-Ghurighuri-Session header (8–128 chars,
 * [a-zA-Z0-9._-]+) and uses it as the session_id for uniqueness aggregates.
 */
class AnalyticsController extends Controller
{
    private function sessionId(Request $request): ?string
    {
        $sid = (string) $request->header('X-Ghurighuri-Session', '');
        if (preg_match('/^[a-zA-Z0-9._-]{8,128}$/', $sid)) {
            return $sid;
        }
        return null;
    }

    /**
     * POST /analytics/pageview
     */
    public function pageview(PageviewRequest $request): Response
    {
        $data = $request->validated();

        AnalyticsEvent::create([
            'event_type' => 'page_view',
            'session_id' => $this->sessionId($request) ?? 'anon-'.substr((string) $request->ip(), 0, 60),
            'path' => $data['path'],
            'ref' => $data['ref'] ?? null,
            'utm_source' => $data['utm_source'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'created_at' => now(),
        ]);

        return response()->noContent();
    }

    /**
     * POST /analytics/outbound-click
     */
    public function outboundClick(OutboundClickRequest $request): Response
    {
        $data = $request->validated();

        AnalyticsEvent::create([
            'event_type' => 'outbound_click',
            'session_id' => $this->sessionId($request) ?? 'anon-'.substr((string) $request->ip(), 0, 60),
            'event_id' => $data['event_id'],
            'label' => $data['label'],
            'href' => $data['href'],
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'created_at' => now(),
        ]);

        return response()->noContent();
    }

    /**
     * POST /analytics/event — form completion (newsletter, submission, etc.).
     */
    public function event(EventTrackingRequest $request): Response
    {
        $data = $request->validated();

        AnalyticsEvent::create([
            'event_type' => 'form_completion',
            'session_id' => $this->sessionId($request) ?? 'anon-'.substr((string) $request->ip(), 0, 60),
            'form_id' => $data['form_id'],
            'meta' => $data['meta'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'created_at' => now(),
        ]);

        return response()->noContent();
    }
}
