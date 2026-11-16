<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SiteController;
use App\Http\Middleware\ApiTokenAuth;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public Site & Page API
    Route::get('/resolve-site', [SiteController::class, 'resolve']);
    Route::get('/sites', [SiteController::class, 'index']);
    Route::get('/sites/{slug}', [SiteController::class, 'show']);
    Route::get('/sites/{slug}/pages', [SiteController::class, 'pages']);
    Route::get('/sites/{slug}/page/{pageSlug?}', [SiteController::class, 'page']);
    Route::put('/sites/{slug}/pages/{pageId}/layout', [SiteController::class, 'updateLayout']);
    Route::post('/sites/{slug}/forms/{formSlug}/submit', [SiteController::class, 'submitForm']);

    // Authentication
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware(ApiTokenAuth::class)->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Admin Management APIs
        Route::prefix('admin/sites/{slug}')->group(function () {
            Route::get('/dashboard', [AdminController::class, 'dashboard']);

            // Pages
            Route::get('/pages', [AdminController::class, 'listPages']);
            Route::post('/pages', [AdminController::class, 'createPage']);
            Route::delete('/pages/{pageId}', [AdminController::class, 'deletePage']);

            // Posts / Blog
            Route::get('/posts', [AdminController::class, 'listPosts']);
            Route::post('/posts', [AdminController::class, 'createPost']);
            Route::put('/posts/{postId}', [AdminController::class, 'updatePost']);
            Route::delete('/posts/{postId}', [AdminController::class, 'deletePost']);

            // Forms & Submissions
            Route::get('/forms', [AdminController::class, 'listForms']);
            Route::get('/submissions', [AdminController::class, 'listSubmissions']);

            // Media / Gallery
            Route::get('/media', [AdminController::class, 'listMedia']);
            Route::post('/media', [AdminController::class, 'uploadMedia']);

            // Email / SMTP
            Route::get('/email-settings', [AdminController::class, 'getEmailSettings']);
            Route::put('/email-settings', [AdminController::class, 'updateEmailSettings']);

            // WordPress Importer
            Route::post('/import-wordpress', [AdminController::class, 'importWordPress']);
        });
    });
});
