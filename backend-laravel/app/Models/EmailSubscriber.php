<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailSubscriber extends Model
{
    protected $fillable = [
        'email',
        'source',
        'ip_address',
        'unsubscribed_at',
    ];

    protected $hidden = [
        'ip_address',
    ];

    protected $casts = [
        'unsubscribed_at' => 'datetime',
    ];
}
