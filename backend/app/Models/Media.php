<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Media extends Model
{
    protected $fillable = [
        'site_id',
        'name',
        'file_path',
        'file_url',
        'mime_type',
        'file_size',
        'alt_text',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }
}
