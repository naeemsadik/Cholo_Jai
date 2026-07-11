<?php

namespace App\Http\Resources;

use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serializes a Submission. The public POST /submissions response uses nested
 * `organizer:{}` shape (frontend contract). Admin list responses use the
 * flat shape (organizer_name, organizer_phone, …) since the admin UI reads
 * flat fields.
 *
 * Pass `new SubmissionResource($submission, isCreateResponse: true)` for
 * the nested flavor.
 */
class SubmissionResource extends JsonResource
{
    private bool $isCreateResponse = false;

    public function __construct(mixed $resource, bool $isCreateResponse = false)
    {
        parent::__construct($resource);
        $this->isCreateResponse = $isCreateResponse;
    }

    public function toArray(Request $request): array
    {
        /** @var Submission $submission */
        $submission = $this->resource;

        $base = [
            'id' => $submission->id,
            'title' => $submission->title,
            'title_bn' => $submission->title_bn,
            'description' => $submission->description,
            'description_bn' => $submission->description_bn,
            'poster_url' => $submission->poster_url,
            'start_date' => $submission->start_date?->toDateString(),
            'end_date' => $submission->end_date?->toDateString(),
            'start_time' => $submission->start_time,
            'city' => $submission->city_name,
            'sub_area' => $submission->sub_area_name,
            'venue_name' => $submission->venue_name,
            'venue_name_bn' => $submission->venue_name_bn,
            'area_details' => $submission->area_details,
            'area_details_bn' => $submission->area_details_bn,
            'maps_link' => null,
            'categories' => $submission->category_names ?? [],
            'audience_tags' => $submission->audience_tag_names ?? [],
            'price_type' => $submission->price_type,
            'price_min' => $submission->price_min,
            'price_max' => $submission->price_max,
            'price_note' => $submission->price_note,
            'outbound_link' => $submission->outbound_link,
            'outbound_button_label' => $submission->outbound_button_label,
            'wants_promotion_support' => (bool) ($submission->wants_promotion_support ?? false),
            'additional_notes' => $submission->additional_notes,
            'review_status' => $submission->review_status,
            'reviewed_by' => $submission->reviewed_by,
            'created_at' => $submission->created_at?->toIso8601String(),
            'updated_at' => $submission->updated_at?->toIso8601String(),
        ];

        if ($this->isCreateResponse) {
            // Frontend expects nested organizer on POST response.
            $base['organizer'] = [
                'name' => $submission->organizer_name,
                'phone' => $submission->organizer_phone,
                'email' => $submission->organizer_email,
                'social_link' => $submission->organizer_website,
            ];
        } else {
            // Flat for admin list/edit views (matches adminGetSubmissions payload).
            $base['organizer_name'] = $submission->organizer_name;
            $base['organizer_phone'] = $submission->organizer_phone;
            $base['organizer_email'] = $submission->organizer_email;
            $base['organizer_social_link'] = $submission->organizer_website;
        }

        return $base;
    }
}
