<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Per-type block content validation for CMS pages.
 * The frontend's CmsBlock union has 5 kinds; each has its own content shape.
 */
class CmsBlockContent implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Walk the data — $attribute is the field path (e.g. "blocks.0.content").
        // Laravel calls this for each block's content if registered correctly,
        // but it's easier to use it as a per-block validator in the request.
        if (! is_array($value)) {
            $fail('The content must be an array.');
            return;
        }
    }

    /**
     * Validate a single block's content array based on its declared type.
     * Called by UpdateCmsPageRequest for each block.
     */
    public static function validateBlock(string $type, array $content, Closure $fail): void
    {
        switch ($type) {
            case 'heading':
                if (empty($content['text']) || ! is_string($content['text'])) {
                    $fail('heading block requires content.text (string).');
                    return;
                }
                $level = $content['level'] ?? null;
                if ($level !== null && ! in_array($level, [1, 2, 3, 4], true)) {
                    $fail('heading block content.level must be 1..4.');
                }
                return;

            case 'paragraph':
                if (empty($content['text']) || ! is_string($content['text'])) {
                    $fail('paragraph block requires content.text (string).');
                }
                return;

            case 'list':
                if (! isset($content['items']) || ! is_array($content['items'])) {
                    $fail('list block requires content.items (array).');
                    return;
                }
                foreach ($content['items'] as $i => $item) {
                    if (! is_string($item)) {
                        $fail("list block items[{$i}] must be a string.");
                        return;
                    }
                }
                return;

            case 'faq':
                if (! isset($content['items']) || ! is_array($content['items'])) {
                    $fail('faq block requires content.items (array of {q, a}).');
                    return;
                }
                foreach ($content['items'] as $i => $item) {
                    if (! is_array($item) || empty($item['q']) || empty($item['a'])) {
                        $fail("faq block items[{$i}] must contain q and a.");
                        return;
                    }
                }
                return;

            case 'image':
                if (empty($content['url']) || empty($content['alt'])) {
                    $fail('image block requires content.url and content.alt.');
                }
                return;
        }
    }
}
