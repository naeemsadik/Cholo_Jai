<?php

namespace App\Services;

use App\Enums\EventStatus;
use App\Models\AudienceTag;
use App\Models\Category;
use App\Models\City;
use App\Models\Event;
use App\Models\SubArea;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Shared helper for Admin\EventController::store and ::update. Centralises
 * the lookup of FKs from string names, slug generation, and pivot syncs.
 */
class EventWriter
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public function write(Event $event, array $validated, bool $fromStore): Event
    {
        // Resolve FKs.
        if (array_key_exists('city', $validated)) {
            $city = $this->resolveCity($validated['city']);
            $event->city_id = $city->id;
        }
        if (array_key_exists('sub_area', $validated)) {
            $subArea = $this->resolveSubArea($validated['sub_area'], $event->city_id);
            $event->sub_area_id = $subArea->id;
        }

        // Auto-generate slug on store; keep it untouched on PATCH.
        if ($fromStore) {
            $event->slug = $this->makeUniqueSlug($validated['title'] ?? 'untitled');
        }

        // Map known fields explicitly.
        $map = [
            'title', 'title_bn', 'description', 'description_bn',
            'poster_url', 'poster_alt', 'poster_alt_bn',
            'venue_name', 'venue_name_bn', 'area_details', 'area_details_bn',
            'start_date', 'end_date', 'start_time',
            'price_type', 'price_min', 'price_max', 'price_note',
            'outbound_link', 'outbound_button_label',
            'is_featured', 'show_in_hero', 'hero_sort_order',
            'organizer_name', 'organizer_phone', 'organizer_email', 'organizer_website',
            'source_link', 'admin_notes',
        ];
        foreach ($map as $key) {
            if (array_key_exists($key, $validated)) {
                $event->{$key} = $validated[$key];
            }
        }

        // Always recompute starts_at (denormalized for fast filters).
        if (array_key_exists('start_date', $validated) || array_key_exists('start_time', $validated)) {
            $event->starts_at = $this->combineStartAt($event->start_date, $event->start_time);
        }

        // Status — if publish helper was passed true, set published + published_at.
        if (! empty($validated['publish'])) {
            $event->status = EventStatus::Published->value;
            $event->published_at = $event->published_at ?? now();
        } elseif (array_key_exists('status', $validated)) {
            $event->status = $validated['status'];
            if ($validated['status'] === EventStatus::Published->value && ! $event->published_at) {
                $event->published_at = now();
            }
            if ($validated['status'] !== EventStatus::Published->value) {
                $event->published_at = null;
            }
        } elseif ($fromStore) {
            $event->status = $validated['status'] ?? EventStatus::Draft->value;
        }

        $event->save();

        // Sync pivots if either was provided.
        if (array_key_exists('categories', $validated)) {
            $ids = $this->resolveCategoryIds((array) $validated['categories']);
            $event->categories()->sync($ids);
        }
        if (array_key_exists('audience_tags', $validated)) {
            $ids = $this->resolveAudienceTagIds((array) $validated['audience_tags']);
            $event->audienceTags()->sync($ids);
        }

        return $event->refresh()->load(['city', 'subArea', 'categories', 'audienceTags']);
    }

    private function resolveCity(string $name): City
    {
        $city = City::query()
            ->whereRaw('LOWER(name) = ?', [mb_strtolower(trim($name))])
            ->first();

        if (! $city) {
            abort(422, "City '{$name}' is not seeded.");
        }

        return $city;
    }

    private function resolveSubArea(string $name, int $cityId): SubArea
    {
        $subArea = SubArea::query()
            ->where('city_id', $cityId)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower(trim($name))])
            ->first();

        if (! $subArea) {
            abort(422, "Sub-area '{$name}' is not seeded under this city.");
        }

        return $subArea;
    }

    private function resolveCategoryIds(array $slugs): array
    {
        $existing = Category::query()->whereIn('slug', $slugs)->pluck('id')->all();
        if (count($existing) !== count($slugs)) {
            abort(422, 'One or more categories do not exist.');
        }
        return $existing;
    }

    private function resolveAudienceTagIds(array $slugs): array
    {
        $existing = AudienceTag::query()->whereIn('slug', $slugs)->pluck('id')->all();
        if (count($existing) !== count($slugs)) {
            abort(422, 'One or more audience tags do not exist.');
        }
        return $existing;
    }

    private function makeUniqueSlug(string $title): string
    {
        $base = Str::slug($title);
        if ($base === '') {
            $base = 'event-'.Str::lower(Str::random(6));
        }

        $slug = $base;
        $suffix = 1;
        while (Event::query()->where('slug', $slug)->withTrashed()->exists()) {
            $suffix++;
            $slug = $base.'-'.$suffix;
        }

        return $slug;
    }

    private function combineStartAt($date, ?string $time): ?Carbon
    {
        if (! $date) {
            return null;
        }
        $carbon = Carbon::parse($date);
        if ($time) {
            $carbon = $carbon->setTimeFromTimeString($time);
        }
        return $carbon;
    }
}
