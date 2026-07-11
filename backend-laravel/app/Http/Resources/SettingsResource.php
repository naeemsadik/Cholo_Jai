<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'site_name' => $this->site_name,
            'tagline' => $this->tagline,
            'default_city' => $this->default_city,
            'default_outbound_label' => $this->default_outbound_label,
            'outbound_labels' => $this->outbound_labels ?? [],
            'pixels' => $this->pixels ?? [],
            'meta_tags' => $this->meta_tags ?? [],
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
