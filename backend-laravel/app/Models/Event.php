<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'submission_id',
        'slug',
        'status',
        'is_featured',
        'show_in_hero',
        'hero_sort_order',
        'organizer_name',
        'organizer_phone',
        'organizer_email',
        'organizer_website',
        'title',
        'title_bn',
        'description',
        'description_bn',
        'poster_url',
        'poster_alt',
        'poster_alt_bn',
        'city_id',
        'sub_area_id',
        'venue_name',
        'venue_name_bn',
        'area_details',
        'area_details_bn',
        'start_date',
        'end_date',
        'start_time',
        'price_type',
        'price_min',
        'price_max',
        'price_note',
        'outbound_link',
        'outbound_button_label',
        'source_link',
        'admin_notes',
        'published_at',
        'starts_at',
    ];

    /**
     * Admin-only fields are NEVER included in the default toArray() output.
     * The EventResource additionally checks $isAdmin and removes organizer.phone.
     */
    protected $hidden = [
        'admin_notes',
        'source_link',
        'deleted_at',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'show_in_hero' => 'boolean',
        'hero_sort_order' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
        'start_time' => 'string',
        'price_min' => 'decimal:2',
        'price_max' => 'decimal:2',
        'published_at' => 'datetime',
        'starts_at' => 'datetime',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function subArea(): BelongsTo
    {
        return $this->belongsTo(SubArea::class);
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'event_category');
    }

    public function audienceTags(): BelongsToMany
    {
        return $this->belongsToMany(AudienceTag::class, 'event_audience_tag');
    }

    public function analyticsEvents(): HasMany
    {
        return $this->hasMany(AnalyticsEvent::class);
    }

    /**
     * Local scope — public routes MUST filter to published only.
     */
    public function scopePublished($query)
    {
        return $query->where('status', \App\Enums\EventStatus::Published->value);
    }

    /**
     * Local scope — exclude events that have already ended.
     * Public listings default to upcoming-only; `featured=true` relaxes this.
     */
    public function scopeUpcoming($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('start_date')->orWhere('start_date', '>=', now()->toDateString());
        });
    }
}
