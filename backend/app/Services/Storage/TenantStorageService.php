<?php

namespace App\Services\Storage;

use App\Models\Form;
use App\Models\Media;
use App\Models\Page;
use App\Models\Post;
use App\Models\Site;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TenantStorageService
{
    /**
     * Get the relative storage path for a tenant
     */
    public function getTenantBasePath(string $siteSlug): string
    {
        return "sites/{$siteSlug}";
    }

    /**
     * Get absolute path on disk for tenant media directory
     */
    public function getTenantMediaAbsolutePath(string $siteSlug): string
    {
        return storage_path("app/public/sites/{$siteSlug}/media");
    }

    /**
     * Get public URL prefix for tenant media
     */
    public function getTenantMediaBaseUrl(string $siteSlug): string
    {
        return "/storage/sites/{$siteSlug}/media";
    }

    /**
     * Store an uploaded file for a site tenant
     */
    public function storeUploadedFile(Site $site, UploadedFile $file, ?string $altText = null): Media
    {
        $siteSlug = $site->slug;
        $originalExt = strtolower($file->getClientOriginalExtension());
        $baseName = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '-' . uniqid();
        $filename = $baseName . '.' . $originalExt;

        $targetDir = $this->getTenantMediaAbsolutePath($siteSlug);
        if (!File::isDirectory($targetDir)) {
            File::makeDirectory($targetDir, 0755, true, true);
        }

        $relPath = "sites/{$siteSlug}/media/" . $filename;
        $storedPath = $file->storeAs("sites/{$siteSlug}/media", $filename, 'public');
        $fullPath = storage_path('app/public/' . $storedPath);

        $meta = [
            'original_name' => $file->getClientOriginalName(),
            'original_size' => $file->getSize(),
            'has_webp' => false,
        ];

        // Generate optimized WebP duplicate for image formats
        $webpMeta = $this->generateWebp($fullPath, $targetDir, $baseName);
        if ($webpMeta) {
            $meta = array_merge($meta, $webpMeta);
        }

        return Media::create([
            'site_id' => $site->id,
            'name' => $filename,
            'file_path' => $relPath,
            'file_url' => "/storage/" . $relPath,
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
            'file_size' => $file->getSize(),
            'alt_text' => $altText ?: $file->getClientOriginalName(),
            'meta' => $meta,
        ]);
    }

    /**
     * Import an existing local file into tenant storage
     */
    public function importLocalFile(Site $site, string $sourceFilePath, string $subPath = '', ?string $altText = null): ?Media
    {
        if (!File::exists($sourceFilePath)) {
            return null;
        }

        $siteSlug = $site->slug;
        $targetBase = $this->getTenantMediaAbsolutePath($siteSlug);
        $cleanSubPath = ltrim($subPath, '/');
        $destDir = $cleanSubPath ? $targetBase . '/' . dirname($cleanSubPath) : $targetBase;
        $fileName = $cleanSubPath ? basename($cleanSubPath) : basename($sourceFilePath);

        if (!File::isDirectory($destDir)) {
            File::makeDirectory($destDir, 0755, true, true);
        }

        $destFilePath = $cleanSubPath ? ($targetBase . '/' . $cleanSubPath) : ($targetBase . '/' . $fileName);
        
        // Copy file
        if ($sourceFilePath !== $destFilePath) {
            File::copy($sourceFilePath, $destFilePath);
        }

        $relPath = "sites/{$siteSlug}/media/" . ($cleanSubPath ?: $fileName);
        $fileSize = File::size($destFilePath);
        $mimeType = File::mimeType($destFilePath) ?: 'application/octet-stream';

        $meta = [
            'original_name' => basename($sourceFilePath),
            'original_size' => $fileSize,
            'has_webp' => false,
        ];

        $baseName = pathinfo($fileName, PATHINFO_FILENAME);
        $webpMeta = $this->generateWebp($destFilePath, $destDir, $baseName);
        if ($webpMeta) {
            $meta = array_merge($meta, $webpMeta);
        }

        return Media::updateOrCreate(
            [
                'site_id' => $site->id,
                'file_path' => $relPath,
            ],
            [
                'name' => $fileName,
                'file_url' => "/storage/" . $relPath,
                'mime_type' => $mimeType,
                'file_size' => $fileSize,
                'alt_text' => $altText ?: pathinfo($fileName, PATHINFO_FILENAME),
                'meta' => $meta,
            ]
        );
    }

    /**
     * Import full WordPress uploads directory into tenant storage
     */
    public function importWpUploads(Site $site, string $wpUploadsDir): array
    {
        if (!File::isDirectory($wpUploadsDir)) {
            return ['success' => false, 'message' => "Dizin bulunamadı: {$wpUploadsDir}", 'count' => 0];
        }

        $siteSlug = $site->slug;
        $targetMediaDir = $this->getTenantMediaAbsolutePath($siteSlug);
        if (!File::isDirectory($targetMediaDir)) {
            File::makeDirectory($targetMediaDir, 0755, true, true);
        }

        $files = File::allFiles($wpUploadsDir);
        $importedCount = 0;
        $totalBytes = 0;

        foreach ($files as $file) {
            $relativePath = str_replace('\\', '/', $file->getRelativePathname());
            $destPath = $targetMediaDir . '/' . $relativePath;
            $destSubDir = dirname($destPath);

            if (!File::isDirectory($destSubDir)) {
                File::makeDirectory($destSubDir, 0755, true, true);
            }

            File::copy($file->getRealPath(), $destPath);
            $importedCount++;
            $totalBytes += $file->getSize();

            // Record in media table
            $relStoragePath = "sites/{$siteSlug}/media/" . $relativePath;
            $mimeType = File::mimeType($destPath) ?: 'application/octet-stream';

            Media::updateOrCreate(
                [
                    'site_id' => $site->id,
                    'file_path' => $relStoragePath,
                ],
                [
                    'name' => basename($relativePath),
                    'file_url' => "/storage/" . $relStoragePath,
                    'mime_type' => $mimeType,
                    'file_size' => $file->getSize(),
                    'alt_text' => pathinfo($file->getFilename(), PATHINFO_FILENAME),
                    'meta' => [
                        'wp_relative_path' => $relativePath,
                    ],
                ]
            );
        }

        return [
            'success' => true,
            'count' => $importedCount,
            'bytes' => $totalBytes,
            'human_size' => round($totalBytes / (1024 * 1024), 2) . ' MB',
        ];
    }

    /**
     * Helper to generate WebP copy with GD, preserving alpha transparency for PNGs
     */
    protected function generateWebp(string $sourceFile, string $destDir, string $baseName): ?array
    {
        if (!function_exists('imagewebp') || !File::exists($sourceFile)) {
            return null;
        }

        $ext = strtolower(pathinfo($sourceFile, PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'bmp'])) {
            return null;
        }

        try {
            $image = null;
            if (in_array($ext, ['jpg', 'jpeg'])) {
                $image = @imagecreatefromjpeg($sourceFile);
            } elseif ($ext === 'png') {
                $image = @imagecreatefrompng($sourceFile);
                if ($image) {
                    imagepalettetotruecolor($image);
                    imagealphablending($image, true);
                    imagesavealpha($image, true);
                }
            } elseif ($ext === 'webp') {
                return null; // Already webp
            }

            if ($image) {
                $webpFilename = $baseName . '.webp';
                $fullWebpPath = $destDir . '/' . $webpFilename;

                if (imagewebp($image, $fullWebpPath, 82)) {
                    imagedestroy($image);
                    $webpSize = File::exists($fullWebpPath) ? File::size($fullWebpPath) : 0;
                    $origSize = File::size($sourceFile);
                    $savings = ($origSize > 0 && $webpSize > 0)
                        ? max(0, round((($origSize - $webpSize) / $origSize) * 100))
                        : 0;

                    $relWebp = str_replace(storage_path('app/public/'), '', $fullWebpPath);

                    return [
                        'has_webp' => true,
                        'webp_url' => '/storage/' . str_replace('\\', '/', $relWebp),
                        'webp_size' => $webpSize,
                        'savings_percentage' => $savings,
                    ];
                }
            }
        } catch (\Throwable $e) {
            Log::warning("TenantStorageService WebP error: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Rewrite any legacy wp-content/uploads/ or absolute domain URLs in text/JSON
     */
    public function rewriteLegacyUrls(string $content, string $siteSlug, array $legacyDomains = []): string
    {
        $tenantBaseUrl = $this->getTenantMediaBaseUrl($siteSlug);

        // Pattern 1: Absolute URLs with domains like https://domain.com/wp-content/uploads/
        foreach ($legacyDomains as $domain) {
            $cleanDomain = preg_quote(trim($domain, '/'), '#');
            $content = preg_replace(
                '#https?://' . $cleanDomain . '/wp-content/uploads/#i',
                $tenantBaseUrl . '/',
                $content
            );
        }

        // Pattern 2: Generic http/https any domain ending with /wp-content/uploads/
        $content = preg_replace(
            '#https?://[^/]+/wp-content/uploads/#i',
            $tenantBaseUrl . '/',
            $content
        );

        // Pattern 3: Relative /wp-content/uploads/
        $content = preg_replace(
            '#/wp-content/uploads/#i',
            $tenantBaseUrl . '/',
            $content
        );

        return $content;
    }

    /**
     * Deeply rewrite all legacy URLs across all tables and settings for a tenant
     */
    public function rewriteAllTenantUrls(Site $site, array $legacyDomains = []): void
    {
        $siteSlug = $site->slug;
        $legacyDomains = array_filter(array_merge($legacyDomains, [
            $site->domain,
            'otizmkonfederasyonu.org.tr',
            'berilzorlu.com',
            'oder.org.tr',
            'omyo.org.tr',
        ]));

        // 1. Rewrite Site Settings & Theme Config
        if (!empty($site->settings)) {
            $json = json_encode($site->settings, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            $rewritten = $this->rewriteLegacyUrls($json, $siteSlug, $legacyDomains);
            $site->settings = json_decode($rewritten, true);
        }

        if (!empty($site->theme_config)) {
            $json = json_encode($site->theme_config, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            $rewritten = $this->rewriteLegacyUrls($json, $siteSlug, $legacyDomains);
            $site->theme_config = json_decode($rewritten, true);
        }
        $site->save();

        // 2. Rewrite Pages Layout & SEO
        $pages = Page::where('site_id', $site->id)->get();
        foreach ($pages as $page) {
            $dirty = false;
            if (!empty($page->layout)) {
                $json = json_encode($page->layout, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                $rewritten = $this->rewriteLegacyUrls($json, $siteSlug, $legacyDomains);
                $page->layout = json_decode($rewritten, true);
                $dirty = true;
            }
            if (!empty($page->seo)) {
                $json = json_encode($page->seo, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                $rewritten = $this->rewriteLegacyUrls($json, $siteSlug, $legacyDomains);
                $page->seo = json_decode($rewritten, true);
                $dirty = true;
            }
            if ($dirty) {
                $page->save();
            }
        }

        // 3. Rewrite Posts Content & Excerpt
        $posts = Post::where('site_id', $site->id)->get();
        foreach ($posts as $post) {
            $dirty = false;
            if (!empty($post->content)) {
                $post->content = $this->rewriteLegacyUrls($post->content, $siteSlug, $legacyDomains);
                $dirty = true;
            }
            if (!empty($post->excerpt)) {
                $post->excerpt = $this->rewriteLegacyUrls($post->excerpt, $siteSlug, $legacyDomains);
                $dirty = true;
            }
            if ($dirty) {
                $post->save();
            }
        }

        // 4. Rewrite Forms Fields
        $forms = Form::where('site_id', $site->id)->get();
        foreach ($forms as $form) {
            if (!empty($form->fields)) {
                $json = json_encode($form->fields, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                $rewritten = $this->rewriteLegacyUrls($json, $siteSlug, $legacyDomains);
                $form->fields = json_decode($rewritten, true);
                $form->save();
            }
        }
    }
}
