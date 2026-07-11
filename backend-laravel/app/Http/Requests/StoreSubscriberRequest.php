<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubscriberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email:rfc',
                'max:190',
                Rule::unique('email_subscribers', 'email')
                    ->whereNull('unsubscribed_at'),
            ],
            'source' => ['nullable', 'string', 'max:80'],
        ];
    }
}
