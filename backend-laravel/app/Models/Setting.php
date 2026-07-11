<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    protected $fillable = [
        'site_name',
        'tagline',
        'default_city',
        'default_outbound_label',
        'outbound_labels',
        'pixels',
        'meta_tags',
        'updated_by',
    ];

    protected $casts = [
        'outbound_labels' => 'array',
        'pixels' => 'array',
        'meta_tags' => 'array',
    ];

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Always operate on the singleton row id=1.
     */
    public static function singleton(): self
    {
        return static::firstOrCreate(['id' => 1]);
    }
}
