<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubmissionRequest;
use App\Http\Resources\SubmissionResource;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;

class SubmissionController extends Controller
{
    /**
     * POST /submissions — public submission intake.
     */
    public function store(StoreSubmissionRequest $request): JsonResponse
    {
        $data = $request->validated();

        $submission = Submission::create([
            'review_status' => 'pending',
            'organizer_name' => $data['organizer_name'],
            'organizer_phone' => $data['organizer_phone'],
            'organizer_email' => $data['organizer_email'] ?? null,
            'organizer_website' => $data['organizer_website'] ?? null,

            'title' => $data['title'],
            'title_bn' => $data['title_bn'] ?? null,
            'description' => $data['description'],
            'description_bn' => $data['description_bn'] ?? null,
            'poster_url' => $data['poster_url'],
            'poster_alt' => $data['poster_alt'] ?? null,
            'poster_alt_bn' => $data['poster_alt_bn'] ?? null,

            'city_name' => $data['city'],
            'sub_area_name' => $data['sub_area'],
            'venue_name' => $data['venue_name'],
            'venue_name_bn' => $data['venue_name_bn'] ?? null,
            'area_details' => $data['area_details'],
            'area_details_bn' => $data['area_details_bn'] ?? null,

            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'] ?? null,
            'start_time' => $data['start_time'] ?? null,

            'price_type' => $data['price_type'],
            'price_min' => $data['price_min'] ?? null,
            'price_max' => $data['price_max'] ?? null,
            'price_note' => $data['price_note'] ?? null,

            'outbound_link' => $data['outbound_link'],
            'outbound_button_label' => $data['outbound_button_label'] ?? null,

            'category_names' => $data['categories'] ?? [],
            'audience_tag_names' => $data['audience_tags'] ?? [],

            'source_link' => $data['source_link'] ?? null,

            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        // The frontend expects the nested organizer form on POST response.
        return response()->json(
            (new SubmissionResource($submission->fresh(), isCreateResponse: true))->toArray($request),
            201
        );
    }
}
