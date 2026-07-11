<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCmsHomeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->is_admin;
    }

    public function rules(): array
    {
        return [
            'order' => ['required', 'array'],
            'sections' => ['required', 'array'],
            'sections.*.type' => ['required', 'string', 'max:40'],
            'sections.*.title' => ['nullable', 'string', 'max:200'],
            'sections.*.config' => ['nullable', 'array'],
        ];
    }
}
