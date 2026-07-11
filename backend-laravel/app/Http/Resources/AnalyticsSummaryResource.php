<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Aggregates from analytics_events + email_subscribers. The actual aggregation
 * happens in AdminAnalyticsController; this resource just formats the result.
 */
class AnalyticsSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return $this->resource;
    }
}
