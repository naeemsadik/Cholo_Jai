<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsHome extends Model
{
    protected $table = 'cms_home';

    protected $fillable = [
        'order_section',
        'sections',
        'updated_by',
    ];

    protected $casts = [
        'order_section' => 'array',
        'sections' => 'array',
    ];

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public static function singleton(): self
    {
        return static::firstOrCreate(['id' => 1]);
    }
}
