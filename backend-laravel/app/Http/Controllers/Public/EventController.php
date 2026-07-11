<?php

namespace App\Http\Controllers\Public;

use App\Enums\EventStatus;
use App\Enums\PriceType;
use App\Http\Controllers\Controller;
use App\Http\Requests\EventIndexRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * GET /events
     *
     * Public listing with all filters. Status=published enforced server-side
     * (PUKU.local.md). Defaults to upcoming-only unless `featured=true`.
     */
    public function index(EventIndexRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $query = Event::query()->published()->with(['city', 'subArea', 'categories', 'audienceTags']);

        // ── Filters ──
        if (! empty($validated['city'])) {
            $query->whereHas('city', fn ($q) => $q->whereRaw('LOWER(name) = ?', [mb_strtolower($validated['city'])]));
        }
        if (! empty($validated['sub_area'])) {
            $query->whereHas('subArea', fn ($q) => $q->whereRaw('LOWER(name) = ?', [mb_strtolower($validated['sub_area'])]));
        }
        if (! empty($validated['category'])) {
            $query->whereHas('categories', fn ($q) => $q->where('slug', $validated['category']));
        }
        if (! empty($validated['audience_tag'])) {
            $query->whereHas('audienceTags', fn ($q) => $q->where('slug', $validated['audience_tag']));
        }
        if (! empty($validated['date_from'])) {
            $query->where('start_date', '>=', $validated['date_from']);
        }
        if (! empty($validated['date_to'])) {
            $query->where('start_date', '<=', $validated['date_to']);
        }
        if ($request->boolean('weekend')) {
            // MySQL: DAYOFWEEK returns 1=Sun, 7=Sat — Fri/Sat/Sun = 6,7,1.
            // SQLite: strftime('%w', start_date) returns TEXT 0=Sun..6=Sat — Fri/Sat/Sun = '5','6','0'.
            // Use CAST to integer for portable comparison (SQLite won't match `strftime(...) = 5` because of type).
            if (\DB::connection()->getDriverName() === 'sqlite') {
                $query->whereRaw("CAST(strftime('%w', start_date) AS INTEGER) IN (5, 6, 0)");
            } else {
                $query->whereRaw('DAYOFWEEK(start_date) IN (6, 7, 1)');
            }
        }
        if (! empty($validated['price_type'])) {
            $query->where('price_type', $validated['price_type']);
        }

        // Upcoming-only by default; featured=true relaxes this so admins can
        // highlight retros.
        if (! $request->boolean('featured')) {
            $query->upcoming();
        }

        // ── Search across title, description, venue, area_details, sub_area, categories, audience_tags ──
        if (! empty($validated['search'])) {
            $needle = mb_strtolower($validated['search']);
            $query->where(function ($q) use ($needle) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$needle}%"])
                    ->orWhereRaw('LOWER(description) LIKE ?', ["%{$needle}%"])
                    ->orWhereRaw('LOWER(venue_name) LIKE ?', ["%{$needle}%"])
                    ->orWhereRaw('LOWER(area_details) LIKE ?', ["%{$needle}%"])
                    ->orWhereHas('subArea', fn ($qq) => $qq->whereRaw('LOWER(name) LIKE ?', ["%{$needle}%"]))
                    ->orWhereHas('categories', fn ($qq) => $qq->whereRaw('LOWER(slug) LIKE ?', ["%{$needle}%"]))
                    ->orWhereHas('audienceTags', fn ($qq) => $qq->whereRaw('LOWER(slug) LIKE ?', ["%{$needle}%"]));
            });
        }

        $events = $query
            ->orderBy('start_date', 'asc')
            ->limit($validated['limit'] ?? 200)
            ->offset($validated['offset'] ?? 0)
            ->get();

        return response()->json(EventResource::collection($events)->collection->all());
    }

    /**
     * GET /events/hero
     */
    public function hero(): JsonResponse
    {
        $events = Event::query()
            ->published()
            ->where('show_in_hero', true)
            ->where('start_date', '>=', now()->toDateString())
            ->with(['city', 'subArea', 'categories', 'audienceTags'])
            ->orderBy('hero_sort_order', 'asc')
            ->orderBy('start_date', 'asc')
            ->limit(8)
            ->get();

        return response()->json(EventResource::collection($events)->collection->all());
    }

    /**
     * GET /events/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        $event = Event::query()
            ->published()
            ->where('slug', $slug)
            ->with(['city', 'subArea', 'categories', 'audienceTags'])
            ->first();

        if (! $event) {
            return response()->json(['message' => 'Event not found.'], 404);
        }

        return response()->json((new EventResource($event))->toArray(request()));
    }
}
