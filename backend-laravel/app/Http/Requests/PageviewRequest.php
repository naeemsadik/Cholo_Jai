<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PageviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'path' => ['required', 'string', 'max:500'],
            'ref' => ['nullable', 'string', 'max:500'],
            'utm_source' => ['nullable', 'string', 'max:80'],
        ];
    }
}
