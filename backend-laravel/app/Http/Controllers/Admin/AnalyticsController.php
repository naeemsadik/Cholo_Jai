<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use App\Models\AudienceTag;
use App\Models\Category;
use App\Models\EmailSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Per plan §11 — GET /admin/analytics/summary. Cached for 60s.
 */
class AnalyticsController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $range = $request->query('range', '30d');
        if (! in_array($range, ['7d', '30d'], true)) {
            $range = '30d';
        }
        $days = $range === '7d' ? 7 : 30;

        return response()->json(Cache::remember(
            'analytics:summary:'.$range,
            60,
            fn () => $this->buildSummary($days, $range)
        ));
    }

    public function eventDetail(Request $request, int $eventId): JsonResponse
    {
        $range = $request->query('range', '30d');
        if (! in_array($range, ['7d', '30d'], true)) {
            $range = '30d';
        }
        $days = $range === '7d' ? 7 : 30;

        return response()->json(Cache::remember(
            'analytics:event:'.$eventId.':'.$range,
            60,
            fn () => $this->buildEventSummary($days, $range, $eventId)
        ));
    }

    private function buildSummary(int $days, string $range): array
    {
        $start = Carbon::now()->subDays($days - 1)->startOfDay();
        $end = Carbon::now()->endOfDay();

        // ── Totals ──
        $base = DB::table('analytics_events')
            ->whereBetween('created_at', [$start, $end]);

        $totalPageviews = (clone $base)->where('event_type', 'page_view')->count();
        $totalOutboundClicks = (clone $base)->where('event_type', 'outbound_click')->count();

        $uniqueSessions = (clone $base)
            ->whereIn('event_type', ['page_view', 'outbound_click'])
            ->distinct('session_id')
            ->count('session_id');

        $conversionRate = $totalPageviews > 0
            ? round($totalOutboundClicks / $totalPageviews, 4)
            : 0.0;

        // ── Daily ──
        $daily = [];
        for ($i = 0; $i < $days; $i++) {
            $day = $start->copy()->addDays($i)->toDateString();
            $dailyStart = $day.' 00:00:00';
            $dailyEnd = $day.' 23:59:59';

            $daily[] = [
                'date' => $day,
                'pageviews' => (clone $base)
                    ->where('event_type', 'page_view')
                    ->whereBetween('created_at', [$dailyStart, $dailyEnd])
                    ->count(),
                'outbound_clicks' => (clone $base)
                    ->where('event_type', 'outbound_click')
                    ->whereBetween('created_at', [$dailyStart, $dailyEnd])
                    ->count(),
            ];
        }

        // ── Top events by views ──
        $topViews = (clone $base)
            ->where('event_type', 'page_view')
            ->whereNotNull('event_id')
            ->select('event_id', DB::raw('count(*) as c'))
            ->groupBy('event_id')
            ->orderByDesc('c')
            ->limit(10)
            ->get();

        $viewsByEventId = $topViews->pluck('c', 'event_id');

        // ── Top events by clicks ──
        $topClicks = (clone $base)
            ->where('event_type', 'outbound_click')
            ->whereNotNull('event_id')
            ->select('event_id', DB::raw('count(*) as c'))
            ->groupBy('event_id')
            ->orderByDesc('c')
            ->limit(10)
            ->get();

        $clicksByEventId = $topClicks->pluck('c', 'event_id');

        $eventIds = $viewsByEventId->keys()->merge($clicksByEventId->keys())->unique();
        $events = \App\Models\Event::query()
            ->whereIn('id', $eventIds)
            ->get(['id', 'title', 'slug'])
            ->keyBy('id');

        $topEventsByViews = $viewsByEventId->map(function ($views, $id) use ($clicksByEventId, $events) {
            $event = $events->get($id);
            if (! $event) {
                return null;
            }
            return [
                'id' => (int) $id,
                'title' => $event->title,
                'slug' => $event->slug,
                'views' => (int) $views,
                'clicks' => (int) ($clicksByEventId[$id] ?? 0),
            ];
        })->filter()->values()->all();

        $topEventsByClicks = $clicksByEventId->map(function ($clicks, $id) use ($viewsByEventId, $events) {
            $event = $events->get($id);
            if (! $event) {
                return null;
            }
            return [
                'id' => (int) $id,
                'title' => $event->title,
                'slug' => $event->slug,
                'views' => (int) ($viewsByEventId[$id] ?? 0),
                'clicks' => (int) $clicks,
            ];
        })->filter()->values()->all();

        // ── Top categories ──
        $topCategoryRows = DB::table('event_category as ec')
            ->join('analytics_events as ae', 'ae.event_id', '=', 'ec.event_id')
            ->join('categories as c', 'c.id', '=', 'ec.category_id')
            ->whereBetween('ae.created_at', [$start, $end])
            ->where('ae.event_type', 'page_view')
            ->select('c.id', 'c.name', 'c.slug', DB::raw('count(*) as c'))
            ->groupBy('c.id', 'c.name', 'c.slug')
            ->orderByDesc('c')
            ->limit(10)
            ->get();

        $topCategoriesShareBase = max(1, $totalPageviews);
        $topCategories = $topCategoryRows->map(fn ($row) => [
            'slug' => $row->slug,
            'name' => $row->name,
            'views' => (int) $row->c,
            'share' => round($row->c / $topCategoriesShareBase, 4),
        ])->all();

        // ── Top sub_areas ──
        $topSubAreaRows = DB::table('events as e')
            ->join('analytics_events as ae', 'ae.event_id', '=', 'e.id')
            ->join('sub_areas as s', 's.id', '=', 'e.sub_area_id')
            ->whereBetween('ae.created_at', [$start, $end])
            ->where('ae.event_type', 'page_view')
            ->select('s.id', 's.name', DB::raw('count(*) as c'))
            ->groupBy('s.id', 's.name')
            ->orderByDesc('c')
            ->limit(10)
            ->get();

        $topSubAreas = $topSubAreaRows->map(fn ($row) => [
            'name' => $row->name,
            'views' => (int) $row->c,
            'share' => round($row->c / $topCategoriesShareBase, 4),
        ])->all();

        // ── Traffic sources ──
        $trafficRows = (clone $base)
            ->whereNotNull('utm_source')
            ->select('utm_source', DB::raw('count(*) as pv'))
            ->where('event_type', 'page_view')
            ->groupBy('utm_source')
            ->orderByDesc('pv')
            ->limit(5)
            ->get();

        $trafficSources = $trafficRows->map(fn ($row) => [
            'source' => $row->utm_source,
            'pageviews' => (int) $row->pv,
            'outbound_clicks' => (int) DB::table('analytics_events')
                ->where('event_type', 'outbound_click')
                ->whereNotNull('utm_source')
                ->where('utm_source', $row->utm_source)
                ->whereBetween('created_at', [$start, $end])
                ->count(),
        ])->all();

        // ── Funnel ──
        $funnel = [
            'visitors' => $uniqueSessions,
            'event_views' => $totalPageviews,
            'outbound_clicks' => $totalOutboundClicks,
            'form_completions' => (int) (clone $base)->where('event_type', 'form_completion')->count(),
        ];

        // ── Recent ──
        $recentRows = (clone $base)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['event_type', 'path', 'event_id', 'ref', 'created_at']);

        $recent = $recentRows->map(fn ($r) => [
            'ts' => $r->created_at,
            'type' => $r->event_type,
            'path' => $r->path,
            'event_id' => $r->event_id,
            'ref' => $r->ref,
        ])->all();

        // ── Form completions & email signups ──
        $formCompletions = (int) (clone $base)->where('event_type', 'form_completion')->count();
        $emailSignups = EmailSubscriber::query()
            ->whereBetween('created_at', [$start, $end])
            ->count();

        return [
            'range' => $range,
            'total_pageviews' => $totalPageviews,
            'total_outbound_clicks' => $totalOutboundClicks,
            'unique_sessions' => $uniqueSessions,
            'unique_events_viewed' => $viewsByEventId->count(),
            'conversion_rate' => $conversionRate,
            'daily' => $daily,
            'top_events_by_views' => $topEventsByViews,
            'top_events_by_clicks' => $topEventsByClicks,
            'top_categories' => $topCategories,
            'top_sub_areas' => $topSubAreas,
            'traffic_sources' => $trafficSources,
            'funnel' => $funnel,
            'recent' => $recent,
            'form_completions' => $formCompletions,
            'email_signups' => $emailSignups,
        ];
    }

    private function buildEventSummary(int $days, string $range, int $eventId): array
    {
        $event = \App\Models\Event::query()->find($eventId);
        if (! $event) {
            abort(404, 'Event not found');
        }

        $start = Carbon::now()->subDays($days - 1)->startOfDay();
        $end = Carbon::now()->endOfDay();

        // ── Totals ──
        $base = DB::table('analytics_events')
            ->where('event_id', $eventId)
            ->whereBetween('created_at', [$start, $end]);

        $totalPageviews = (clone $base)->where('event_type', 'page_view')->count();
        $totalOutboundClicks = (clone $base)->where('event_type', 'outbound_click')->count();

        $uniqueSessions = (clone $base)
            ->whereIn('event_type', ['page_view', 'outbound_click'])
            ->distinct('session_id')
            ->count('session_id');

        $conversionRate = $totalPageviews > 0
            ? round($totalOutboundClicks / $totalPageviews, 4)
            : 0.0;

        // ── Daily ──
        $daily = [];
        for ($i = 0; $i < $days; $i++) {
            $day = $start->copy()->addDays($i)->toDateString();
            $dailyStart = $day.' 00:00:00';
            $dailyEnd = $day.' 23:59:59';

            $daily[] = [
                'date' => $day,
                'pageviews' => (clone $base)
                    ->where('event_type', 'page_view')
                    ->whereBetween('created_at', [$dailyStart, $dailyEnd])
                    ->count(),
                'outbound_clicks' => (clone $base)
                    ->where('event_type', 'outbound_click')
                    ->whereBetween('created_at', [$dailyStart, $dailyEnd])
                    ->count(),
            ];
        }

        // ── Traffic sources ──
        $trafficRows = (clone $base)
            ->whereNotNull('utm_source')
            ->select('utm_source', DB::raw('count(*) as pv'))
            ->where('event_type', 'page_view')
            ->groupBy('utm_source')
            ->orderByDesc('pv')
            ->limit(5)
            ->get();

        $trafficSources = $trafficRows->map(fn ($row) => [
            'source' => $row->utm_source,
            'pageviews' => (int) $row->pv,
            'outbound_clicks' => (int) DB::table('analytics_events')
                ->where('event_id', $eventId)
                ->where('event_type', 'outbound_click')
                ->whereNotNull('utm_source')
                ->where('utm_source', $row->utm_source)
                ->whereBetween('created_at', [$start, $end])
                ->count(),
        ])->all();

        // ── Recent ──
        $recentRows = (clone $base)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['event_type', 'path', 'event_id', 'ref', 'created_at']);

        $recent = $recentRows->map(fn ($r) => [
            'ts' => $r->created_at,
            'type' => $r->event_type,
            'path' => $r->path,
            'event_id' => $r->event_id,
            'ref' => $r->ref,
        ])->all();

        return [
            'event_id' => (string) $eventId,
            'title' => $event->title,
            'slug' => $event->slug,
            'range' => $range,
            'total_pageviews' => $totalPageviews,
            'total_outbound_clicks' => $totalOutboundClicks,
            'unique_sessions' => $uniqueSessions,
            'conversion_rate' => $conversionRate,
            'daily' => $daily,
            'traffic_sources' => $trafficSources,
            'recent' => $recent,
        ];
    }
}
