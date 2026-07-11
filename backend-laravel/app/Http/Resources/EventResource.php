<?php

namespace App\Http\Resources;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serializes an Event for either public or admin consumption.
 *
 * Pass `new EventResource($event, isAdmin: true)` from admin controllers
 * to include admin_notes, source_link, and organizer.phone.
 */
class EventResource extends JsonResource
{
    private bool $isAdmin = false;

    public function __construct(mixed $resource, bool $isAdmin = false)
    {
        parent::__construct($resource);
        $this->isAdmin = $isAdmin;
    }

    public function toArray(Request $request): array
    {
        /** @var Event $event */
        $event = $this->resource;

        $data = [
            'id' => $event->id,
            'slug' => $event->slug,
            'status' => $event->status,
            'is_featured' => (bool) $event->is_featured,
            'show_in_hero' => (bool) $event->show_in_hero,
            'hero_sort_order' => (int) ($event->hero_sort_order ?? 0),
            'title' => $event->title,
            'title_bn' => $event->title_bn,
            'description' => $event->description,
            'description_bn' => $event->description_bn,
            'poster_url' => $event->poster_url,
            'poster_alt' => $event->poster_alt,
            'poster_alt_bn' => $event->poster_alt_bn,

            'city' => $event->city ? [
                'id' => $event->city->id,
                'name' => $event->city->name,
                'slug' => $event->city->slug,
            ] : null,
            'sub_area' => $event->subArea ? [
                'id' => $event->subArea->id,
                'name' => $event->subArea->name,
                'slug' => $event->subArea->slug,
            ] : null,

            'venue_name' => $event->venue_name,
            'venue_name_bn' => $event->venue_name_bn,
            'area_details' => $event->area_details,
            'area_details_bn' => $event->area_details_bn,

            'start_date' => $event->start_date?->toDateString(),
            'end_date' => $event->end_date?->toDateString(),
            'start_time' => $event->start_time,

            'price_type' => $event->price_type,
            'price_min' => $event->price_min,
            'price_max' => $event->price_max,
            'price_note' => $event->price_note,

            'outbound_link' => $event->outbound_link,
            'outbound_button_label' => $event->outbound_button_label,

            'categories' => $event->categories->pluck('slug')->all(),
            'audience_tags' => $event->audienceTags->pluck('slug')->all(),

            'organizer' => [
                'name' => $event->organizer_name,
                // Phone is hidden publicly per PUKU.local.md / plan §21.3.
                'phone' => $this->isAdmin ? $event->organizer_phone : null,
                'email' => $event->organizer_email,
                'website' => $event->organizer_website,
            ],

            'published_at' => $event->published_at?->toIso8601String(),
            'created_at' => $event->created_at?->toIso8601String(),
            'updated_at' => $event->updated_at?->toIso8601String(),
        ];

        // Admin-only fields — the Event model already hides admin_notes &
        // source_link from default array output, but be explicit here too.
        if ($this->isAdmin) {
            $data['admin_notes'] = $event->admin_notes;
            $data['source_link'] = $event->source_link;
            $data['submission_id'] = $event->submission_id;
        }

        return $data;
    }
}
