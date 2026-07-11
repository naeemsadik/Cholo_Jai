<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsEvent extends Model
{
    /**
     * analytics_events has no updated_at; created_at is the only timestamp.
     */
    public $timestamps = false;

    protected $fillable = [
        'event_type',
        'session_id',
        'path',
        'event_id',
        'label',
        'href',
        'form_id',
        'ref',
        'utm_source',
        'meta',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'meta' => 'array',
        'created_at' => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
