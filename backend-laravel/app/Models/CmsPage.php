<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsPage extends Model
{
    protected $table = 'cms_pages';

    protected $fillable = [
        'slug',
        'title',
        'blocks',
        'published',
        'updated_by',
    ];

    protected $casts = [
        'blocks' => 'array',
        'published' => 'boolean',
    ];

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
