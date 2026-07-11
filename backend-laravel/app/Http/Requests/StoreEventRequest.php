<?php

namespace App\Http\Requests;

use App\Enums\EventStatus;
use App\Enums\PriceType;
use App\Rules\ExistsInLookup;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->is_admin;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'title_bn' => ['nullable', 'string', 'max:200'],
            'description' => ['required', 'string', 'max:20000'],
            'description_bn' => ['nullable', 'string', 'max:20000'],
            'poster_url' => ['required', 'url', 'max:500'],
            'poster_alt' => ['nullable', 'string', 'max:255'],
            'poster_alt_bn' => ['nullable', 'string', 'max:255'],

            'city' => ['required', 'string', 'max:80', new ExistsInLookup('cities', 'name')],
            'sub_area' => ['required', 'string', 'max:120', new ExistsInLookup('sub_areas', 'name')],

            'venue_name' => ['required', 'string', 'max:200'],
            'venue_name_bn' => ['nullable', 'string', 'max:200'],
            'area_details' => ['required', 'string', 'max:500'],
            'area_details_bn' => ['nullable', 'string', 'max:500'],

            'start_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],

            'price_type' => ['required', Rule::enum(PriceType::class)],
            'price_min' => ['nullable', 'numeric', 'min:0', 'required_if:price_type,paid'],
            'price_max' => ['nullable', 'numeric', 'min:0', 'gte:price_min', 'required_if:price_type,paid'],
            'price_note' => ['nullable', 'string', 'max:255', 'required_if:price_type,paid'],

            'outbound_link' => ['required', 'url', 'max:500', 'regex:/^https?:\/\//i'],
            'outbound_button_label' => ['nullable', 'string', 'max:80'],

            'is_featured' => ['boolean'],
            'show_in_hero' => ['boolean'],
            'hero_sort_order' => ['nullable', 'integer', 'min:0'],

            'status' => ['required', Rule::enum(EventStatus::class)],

            'categories' => ['required', 'array', 'min:1'],
            'categories.*' => ['string', 'exists:categories,slug'],
            'audience_tags' => ['nullable', 'array'],
            'audience_tags.*' => ['string', 'exists:audience_tags,slug'],

            'organizer_name' => ['required', 'string', 'max:160'],
            'organizer_phone' => ['nullable', 'string', 'max:40'],
            'organizer_email' => ['nullable', 'email', 'max:190'],
            'organizer_website' => ['nullable', 'url', 'max:255'],

            'source_link' => ['nullable', 'url', 'max:500'],
            'admin_notes' => ['nullable', 'string', 'max:5000'],

            // admin UI convenience — if true, status is forced to published
            // and published_at is set automatically server-side.
            'publish' => ['boolean'],
        ];
    }
}
