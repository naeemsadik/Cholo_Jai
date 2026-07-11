<?php

namespace App\Http\Requests;

use App\Enums\PriceType;
use App\Rules\ExistsInLookup;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // public route
    }

    public function rules(): array
    {
        return [
            // Organizer — phone REQUIRED on submissions (admin events have it optional).
            'organizer_name' => ['required', 'string', 'max:160'],
            'organizer_phone' => ['required', 'string', 'max:40', 'regex:/^[+0-9\-\s()]{6,40}$/'],
            'organizer_email' => ['nullable', 'email', 'max:190'],
            'organizer_website' => ['nullable', 'url', 'max:255'],

            // Content
            'title' => ['required', 'string', 'max:200'],
            'title_bn' => ['nullable', 'string', 'max:200'],
            'description' => ['required', 'string', 'max:20000'],
            'description_bn' => ['nullable', 'string', 'max:20000'],
            'poster_url' => ['required', 'url', 'max:500'],
            'poster_alt' => ['nullable', 'string', 'max:255'],
            'poster_alt_bn' => ['nullable', 'string', 'max:255'],

            // Location
            'city' => ['required', 'string', 'max:80', new ExistsInLookup('cities', 'name')],
            'sub_area' => ['required', 'string', 'max:120', new ExistsInLookup('sub_areas', 'name')],
            'venue_name' => ['required', 'string', 'max:200'],
            'venue_name_bn' => ['nullable', 'string', 'max:200'],
            'area_details' => ['required', 'string', 'max:500'],
            'area_details_bn' => ['nullable', 'string', 'max:500'],
            'maps_link' => ['nullable', 'url', 'max:500'],

            // Schedule
            'start_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],

            // Price
            'price_type' => ['required', Rule::enum(PriceType::class)],
            'price_min' => ['nullable', 'numeric', 'min:0', 'required_if:price_type,paid'],
            'price_max' => ['nullable', 'numeric', 'min:0', 'gte:price_min', 'required_if:price_type,paid'],
            'price_note' => ['nullable', 'string', 'max:255', 'required_if:price_type,paid'],

            // Outbound
            'outbound_link' => ['required', 'url', 'max:500', 'regex:/^https?:\/\//i'],
            'outbound_button_label' => ['nullable', 'string', 'max:80'],

            // Categories / tags
            'categories' => ['required', 'array', 'min:1'],
            'categories.*' => ['string', 'exists:categories,slug'],
            'audience_tags' => ['nullable', 'array'],
            'audience_tags.*' => ['string', 'exists:audience_tags,slug'],

            // Submission-only fields
            'expected_attendance' => ['nullable', 'integer', 'min:0'],
            'wants_promotion_support' => ['nullable', 'boolean'],
            'additional_notes' => ['nullable', 'string', 'max:5000'],

            // Admin-only
            'source_link' => ['nullable', 'url', 'max:500'],
        ];
    }
}
