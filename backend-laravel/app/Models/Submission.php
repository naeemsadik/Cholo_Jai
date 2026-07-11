<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Submission extends Model
{
    protected $fillable = [
        'review_status',
        'review_note',
        'reviewed_by',
        'reviewed_at',
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
        'city_name',
        'sub_area_name',
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
        'category_names',
        'audience_tag_names',
        'ip_address',
        'user_agent',
    ];

    protected $hidden = [
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'start_date' => 'date',
        'end_date' => 'date',
        'start_time' => 'string',
        'price_min' => 'decimal:2',
        'price_max' => 'decimal:2',
        'category_names' => 'array',
        'audience_tag_names' => 'array',
    ];

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function event(): HasOne
    {
        return $this->hasOne(Event::class, 'submission_id');
    }
}
