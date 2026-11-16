<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    protected $fillable = [
        'site_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'layout',
        'featured_image',
        'published_at',
        'status',
    ];

    protected $casts = [
        'layout' => 'array',
        'published_at' => 'datetime',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }
}
