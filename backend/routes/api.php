<?php

use App\Http\Controllers\Api\SiteController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/resolve-site', [SiteController::class, 'resolve']);
    Route::get('/sites', [SiteController::class, 'index']);
    Route::get('/sites/{slug}', [SiteController::class, 'show']);
    Route::get('/sites/{slug}/pages', [SiteController::class, 'pages']);
    Route::get('/sites/{slug}/page/{pageSlug?}', [SiteController::class, 'page']);
    Route::put('/sites/{slug}/pages/{pageId}/layout', [SiteController::class, 'updateLayout']);
    Route::post('/sites/{slug}/forms/{formSlug}/submit', [SiteController::class, 'submitForm']);
});
