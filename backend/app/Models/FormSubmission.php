<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class FormSubmission extends Model
{
    protected $fillable = [
        'form_id',
        'site_id',
        'data',
        'status',
        'tracking_token',
        'is_public',
        'admin_notes',
        'history',
        'ip_address',
    ];

    protected $casts = [
        'data' => 'array',
        'history' => 'array',
        'is_public' => 'boolean',
    ];

    protected static function booted()
    {
        static::creating(function ($submission) {
            if (empty($submission->tracking_token)) {
                $submission->tracking_token = 'sub_' . Str::random(12);
            }
            if (empty($submission->status)) {
                $submission->status = 'new';
            }
            if (empty($submission->history)) {
                $submission->history = [
                    [
                        'status' => 'new',
                        'label' => 'Yeni Başvuru Alındı',
                        'note' => 'Başvuru form üzerinden başarıyla sisteme kaydedildi.',
                        'changed_at' => now()->toISOString(),
                        'changed_by' => 'Sistem',
                    ]
                ];
            }
        });
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }
}
