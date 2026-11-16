<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SiteController;

// Dynamic SEO Endpoints
Route::get('/sitemap.xml', [SiteController::class, 'sitemap']);
Route::get('/robots.txt', [SiteController::class, 'robots']);

Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }
    return view('welcome');
})->where('any', '^(?!api|sitemap\.xml|robots\.txt).*$');
