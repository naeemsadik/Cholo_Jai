<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EventTrackingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'form_id' => ['required', 'string', 'max:80'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
