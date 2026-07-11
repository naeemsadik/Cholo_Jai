<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Http\Requests\UpdateEventStatusRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Services\EventWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function __construct(private readonly EventWriter $writer) {}

    /**
     * GET /admin/events — all statuses, all soft-deletes hidden by default.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::query()->with(['city', 'subArea', 'categories', 'audienceTags']);

        if ($request->boolean('trashed')) {
            $query->withTrashed();
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($search = $request->query('q')) {
            $needle = mb_strtolower($search);
            $query->where(function ($q) use ($needle) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$needle}%"])
                    ->orWhereRaw('LOWER(slug) LIKE ?', ["%{$needle}%"]);
            });
        }

        $events = $query->orderByDesc('updated_at')->get();

        return response()->json(
            EventResource::collection($events->map(fn ($e) => new EventResource($e, isAdmin: true)))->collection->all()
        );
    }

    /**
     * GET /admin/events/{id}
     */
    public function show(int $id): JsonResponse
    {
        $event = Event::query()->withTrashed()->with(['city', 'subArea', 'categories', 'audienceTags'])->find($id);

        if (! $event) {
            return response()->json(['message' => 'Event not found.'], 404);
        }

        return response()->json((new EventResource($event, isAdmin: true))->toArray(request()));
    }

    /**
     * POST /admin/events
     */
    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = new Event();
        $event = $this->writer->write($event, $request->validated(), fromStore: true);

        return response()->json((new EventResource($event, isAdmin: true))->toArray($request), 201);
    }

    /**
     * PATCH /admin/events/{id}
     */
    public function update(UpdateEventRequest $request, int $id): JsonResponse
    {
        $event = Event::query()->withTrashed()->find($id);
        if (! $event) {
            return response()->json(['message' => 'Event not found.'], 404);
        }

        $event = $this->writer->write($event, $request->validated(), fromStore: false);

        return response()->json((new EventResource($event, isAdmin: true))->toArray($request));
    }

    /**
     * DELETE /admin/events/{id} — soft delete (status -> archived, deleted_at set).
     */
    public function destroy(int $id): JsonResponse
    {
        $event = Event::query()->find($id);
        if (! $event) {
            return response()->json(['message' => 'Event not found.'], 404);
        }
        $event->delete();
        return response()->json(['ok' => true]);
    }

    /**
     * PATCH /admin/events/{id}/status
     */
    public function updateStatus(UpdateEventStatusRequest $request, int $id): JsonResponse
    {
        $event = Event::query()->find($id);
        if (! $event) {
            return response()->json(['message' => 'Event not found.'], 404);
        }

        $newStatus = $request->validated()['status'];
        $event->status = $newStatus;
        if ($newStatus === 'published') {
            $event->published_at = $event->published_at ?? now();
        } else {
            $event->published_at = null;
        }
        $event->save();

        return response()->json((new EventResource($event->fresh()->load(['city', 'subArea', 'categories', 'audienceTags']), isAdmin: true))->toArray($request));
    }
}
