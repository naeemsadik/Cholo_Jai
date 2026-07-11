<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CmsHomeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // The DB column is `order_section` because `order` is a reserved word.
            // The frontend expects `order`.
            'order' => $this->order_section ?? [],
            'sections' => $this->sections ?? [],
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
