<?php

use App\Http\Controllers\Api\SiteController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/sites/{slug}', [SiteController::class, 'show']);
    Route::get('/sites/{slug}/page/{pageSlug?}', [SiteController::class, 'page']);
    Route::post('/sites/{slug}/forms/{formSlug}/submit', [SiteController::class, 'submitForm']);
});
