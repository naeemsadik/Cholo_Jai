<?php

namespace App\Http\Requests;

use App\Enums\PriceType;
use App\Rules\ExistsInLookup;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->is_admin;
    }

    public function rules(): array
    {
        return [
            'organizer_name' => ['sometimes', 'string', 'max:160'],
            'organizer_phone' => ['sometimes', 'string', 'max:40'],
            'organizer_email' => ['sometimes', 'nullable', 'email', 'max:190'],
            'organizer_website' => ['sometimes', 'nullable', 'url', 'max:255'],

            'title' => ['sometimes', 'string', 'max:200'],
            'title_bn' => ['sometimes', 'nullable', 'string', 'max:200'],
            'description' => ['sometimes', 'string', 'max:20000'],
            'description_bn' => ['sometimes', 'nullable', 'string', 'max:20000'],
            'poster_url' => ['sometimes', 'url', 'max:500'],

            'city' => ['sometimes', 'string', 'max:80', new ExistsInLookup('cities', 'name')],
            'sub_area' => ['sometimes', 'string', 'max:120', new ExistsInLookup('sub_areas', 'name')],

            'venue_name' => ['sometimes', 'string', 'max:200'],
            'venue_name_bn' => ['sometimes', 'nullable', 'string', 'max:200'],
            'area_details' => ['sometimes', 'string', 'max:500'],
            'area_details_bn' => ['sometimes', 'nullable', 'string', 'max:500'],

            'start_date' => ['sometimes', 'date_format:Y-m-d'],
            'end_date' => ['sometimes', 'nullable', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'start_time' => ['sometimes', 'nullable', 'date_format:H:i'],

            'price_type' => ['sometimes', Rule::enum(PriceType::class)],
            'price_min' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'price_max' => ['sometimes', 'nullable', 'numeric', 'min:0', 'gte:price_min'],
            'price_note' => ['sometimes', 'nullable', 'string', 'max:255'],

            'outbound_link' => ['sometimes', 'url', 'max:500', 'regex:/^https?:\/\//i'],
            'outbound_button_label' => ['sometimes', 'nullable', 'string', 'max:80'],

            'categories' => ['sometimes', 'array', 'min:1'],
            'categories.*' => ['string', 'exists:categories,slug'],
            'audience_tags' => ['sometimes', 'nullable', 'array'],
            'audience_tags.*' => ['string', 'exists:audience_tags,slug'],

            'wants_promotion_support' => ['sometimes', 'boolean'],
            'additional_notes' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ];
    }
}
