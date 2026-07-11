<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OutboundClickRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'label' => ['required', 'string', 'max:80'],
            'href' => ['required', 'url', 'max:500'],
        ];
    }
}
