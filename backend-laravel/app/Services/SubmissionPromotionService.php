<?php

namespace App\Services;

use App\Enums\EventStatus;
use App\Enums\ReviewStatus;
use App\Exceptions\SubmissionPromotionException;
use App\Models\AudienceTag;
use App\Models\Category;
use App\Models\City;
use App\Models\Event;
use App\Models\Submission;
use App\Models\SubArea;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * Per plan §12 — atomically promotes a Submission to an Event row inside a
 * DB transaction with row-level locking. On the rejection branch, just updates
 * the submission review fields; the submission row remains as audit trail.
 */
class SubmissionPromotionService
{
    /**
     * @return array{submission: Submission, promoted_event_id: ?int}
     *
     * @throws SubmissionPromotionException
     */
    public function review(
        Submission $submission,
        ReviewStatus $reviewStatus,
        ?string $note = null,
        bool $publish = false,
        ?int $reviewerId = null,
    ): array {
        return DB::transaction(function () use ($submission, $reviewStatus, $note, $publish, $reviewerId) {
            $locked = Submission::query()
                ->whereKey($submission->id)
                ->lockForUpdate()
                ->first();

            if (! $locked) {
                throw (new ModelNotFoundException())->setModel(Submission::class, [$submission->id]);
            }

            if ($locked->review_status === ReviewStatus::Approved->value) {
                // Idempotency: already approved. Return existing linkage if any.
                return [
                    'submission' => $locked,
                    'promoted_event_id' => $locked->event?->id,
                ];
            }

            $promotedEventId = null;

            if ($reviewStatus === ReviewStatus::Approved) {
                // Resolve city_id from city_name (case-insensitive).
                $city = City::query()
                    ->whereRaw('LOWER(name) = ?', [mb_strtolower(trim($locked->city_name))])
                    ->first();

                if (! $city) {
                    throw new SubmissionPromotionException(
                        "City '{$locked->city_name}' is not seeded. Add it to the cities table first."
                    );
                }

                // Resolve sub_area_id; reject if not seeded.
                $subArea = SubArea::query()
                    ->where('city_id', $city->id)
                    ->whereRaw('LOWER(name) = ?', [mb_strtolower(trim($locked->sub_area_name))])
                    ->first();

                if (! $subArea) {
                    throw new SubmissionPromotionException(
                        "Sub-area '{$locked->sub_area_name}' is not seeded under city '{$city->name}'."
                    );
                }

                // Categories and audience tags must exist by slug.
                $categorySlugs = (array) ($locked->category_names ?? []);
                $audienceTagSlugs = (array) ($locked->audience_tag_names ?? []);

                if (empty($categorySlugs)) {
                    throw new SubmissionPromotionException('Submission is missing categories.');
                }

                $categoryIds = Category::query()
                    ->whereIn('slug', $categorySlugs)
                    ->pluck('id', 'slug');

                if ($categoryIds->count() !== count($categorySlugs)) {
                    $missing = array_diff($categorySlugs, $categoryIds->keys()->all());
                    throw new SubmissionPromotionException(
                        'Unknown category slugs: '.implode(', ', $missing)
                    );
                }

                $audienceTagIds = collect();
                if (! empty($audienceTagSlugs)) {
                    $audienceTagIds = AudienceTag::query()
                        ->whereIn('slug', $audienceTagSlugs)
                        ->pluck('id', 'slug');

                    if ($audienceTagIds->count() !== count($audienceTagSlugs)) {
                        $missing = array_diff($audienceTagSlugs, $audienceTagIds->keys()->all());
                        throw new SubmissionPromotionException(
                            'Unknown audience-tag slugs: '.implode(', ', $missing)
                        );
                    }
                }

                $status = $publish ? EventStatus::Published : EventStatus::Draft;

                $event = Event::create([
                    'submission_id' => $locked->id,
                    'slug' => $this->makeUniqueSlug($locked->title),
                    'status' => $status->value,
                    'is_featured' => false,
                    'show_in_hero' => false,
                    'hero_sort_order' => 0,

                    'organizer_name' => $locked->organizer_name,
                    'organizer_phone' => $locked->organizer_phone,
                    'organizer_email' => $locked->organizer_email,
                    'organizer_website' => $locked->organizer_website,

                    'title' => $locked->title,
                    'title_bn' => $locked->title_bn,
                    'description' => $locked->description,
                    'description_bn' => $locked->description_bn,
                    'poster_url' => $locked->poster_url,
                    'poster_alt' => $locked->poster_alt,
                    'poster_alt_bn' => $locked->poster_alt_bn,

                    'city_id' => $city->id,
                    'sub_area_id' => $subArea->id,
                    'venue_name' => $locked->venue_name,
                    'venue_name_bn' => $locked->venue_name_bn,
                    'area_details' => $locked->area_details,
                    'area_details_bn' => $locked->area_details_bn,

                    'start_date' => $locked->start_date,
                    'end_date' => $locked->end_date,
                    'start_time' => $locked->start_time,

                    'price_type' => $locked->price_type,
                    'price_min' => $locked->price_min,
                    'price_max' => $locked->price_max,
                    'price_note' => $locked->price_note,

                    'outbound_link' => $locked->outbound_link,
                    'outbound_button_label' => $locked->outbound_button_label,

                    'source_link' => $locked->source_link,
                    'published_at' => $publish ? now() : null,
                    'starts_at' => $this->combineStartAt($locked->start_date, $locked->start_time),
                ]);

                // Sync pivot tables.
                $event->categories()->sync($categoryIds->values()->all());
                $event->audienceTags()->sync($audienceTagIds->values()->all());

                $promotedEventId = $event->id;
            }

            $locked->review_status = $reviewStatus->value;
            $locked->review_note = $note;
            $locked->reviewed_by = $reviewerId;
            $locked->reviewed_at = now();
            $locked->save();

            return [
                'submission' => $locked->fresh(),
                'promoted_event_id' => $promotedEventId,
            ];
        });
    }

    /**
     * Generate a unique URL-safe slug. Bangla titles produce an empty slug from
     * Str::slug(), so we append a 6-char base36 suffix when that happens.
     */
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

    private function combineStartAt($date, ?string $time): ?\Illuminate\Support\Carbon
    {
        if (! $date) {
            return null;
        }
        $carbon = \Illuminate\Support\Carbon::parse($date);
        if ($time) {
            $carbon = $carbon->setTimeFromTimeString($time);
        }
        return $carbon;
    }
}
