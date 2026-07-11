<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->is_admin;
    }

    public function rules(): array
    {
        return [
            // Accept either `file` or `image` for client-tolerance.
            'file' => ['required_without:image', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'image' => ['required_without:file', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
