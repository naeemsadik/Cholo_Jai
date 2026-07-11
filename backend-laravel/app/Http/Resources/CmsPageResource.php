<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CmsPageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'blocks' => $this->blocks ?? [],
            'published' => (bool) $this->published,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
