<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Site extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'domain',
        'description',
        'settings',
        'theme_config',
        'status',
    ];

    protected $casts = [
        'settings' => 'array',
        'theme_config' => 'array',
    ];

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class);
    }

    public function forms(): HasMany
    {
        return $this->hasMany(Form::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class);
    }
}
