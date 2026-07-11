<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function subAreas(): HasMany
    {
        return $this->hasMany(SubArea::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}
