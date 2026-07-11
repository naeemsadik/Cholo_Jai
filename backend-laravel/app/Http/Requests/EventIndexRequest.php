<?php

namespace App\Http\Requests;

use App\Enums\PriceType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EventIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Booleans are read with $request->boolean() inside the controller —
        // query strings are accepted as "true"/"1"/"yes" without needing
        // strict boolean validation (which rejects "true").
        return [
            'city' => ['nullable', 'string', 'max:80'],
            'sub_area' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:80'],
            'audience_tag' => ['nullable', 'string', 'max:80'],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'weekend' => ['nullable', 'in:0,1,true,false'],
            'search' => ['nullable', 'string', 'max:120'],
            'featured' => ['nullable', 'in:0,1,true,false'],
            'price_type' => ['nullable', Rule::enum(PriceType::class)],
            'limit' => ['nullable', 'integer', 'min:1', 'max:200'],
            'offset' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
