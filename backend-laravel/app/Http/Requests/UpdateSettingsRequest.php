<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->is_admin;
    }

    public function rules(): array
    {
        return [
            'site_name' => ['required', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'default_city' => ['required', 'string', 'max:80'],
            'default_outbound_label' => ['required', 'string', 'max:80'],

            'outbound_labels' => ['required', 'array', 'min:1'],
            'outbound_labels.*' => ['string', 'max:80'],

            'pixels' => ['array'],
            'pixels.*.provider' => ['required_with:pixels', 'string', 'in:meta,ga4,gtm,tiktok,linkedin,other'],
            'pixels.*.id' => ['required_with:pixels', 'string', 'max:80'],
            'pixels.*.active' => ['required_with:pixels', 'boolean'],

            'meta_tags' => ['array'],
            'meta_tags.*.key' => ['required_with:meta_tags', 'string', 'max:80'],
            'meta_tags.*.value' => ['required_with:meta_tags', 'string', 'max:1000'],
        ];
    }
}
