<?php

namespace App\Http\Requests;

use App\Enums\ReviewStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReviewSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->is_admin;
    }

    public function rules(): array
    {
        return [
            'review_status' => ['required', Rule::enum(ReviewStatus::class)],
            'note' => ['nullable', 'string', 'max:2000'],
            // Promote with status='published' (instead of 'draft') on approval.
            'publish' => ['boolean'],
        ];
    }
}
