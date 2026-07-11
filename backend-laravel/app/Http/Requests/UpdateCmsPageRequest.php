<?php

namespace App\Http\Requests;

use App\Rules\CmsBlockContent;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCmsPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->is_admin;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'blocks' => ['required', 'array', 'min:1'],

            'blocks.*.id' => ['required', 'string', 'max:40'],
            'blocks.*.type' => ['required', 'string', 'in:heading,paragraph,faq,list,image'],
            'blocks.*.content' => ['required', 'array'],

            'published' => ['boolean'],
        ];
    }

    /**
     * Per-block content validation once Laravel has parsed the array.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $blocks = $this->input('blocks', []);
            if (! is_array($blocks)) {
                return;
            }
            foreach ($blocks as $i => $block) {
                if (! is_array($block)) {
                    continue;
                }
                $type = $block['type'] ?? null;
                $content = $block['content'] ?? null;
                if (! $type || ! is_array($content)) {
                    continue;
                }
                CmsBlockContent::validateBlock($type, $content, function (string $message) use ($validator, $i) {
                    $validator->errors()->add("blocks.{$i}.content", $message);
                });
            }
        });
    }
}
