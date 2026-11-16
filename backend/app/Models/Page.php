<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Page extends Model
{
    protected $fillable = [
        'site_id',
        'title',
        'slug',
        'is_home',
        'layout',
        'seo',
        'status',
    ];

    protected $casts = [
        'is_home' => 'boolean',
        'layout' => 'array',
        'seo' => 'array',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }
}
