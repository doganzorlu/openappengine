<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Media;
use App\Models\Page;
use App\Models\Post;
use App\Models\Site;
use App\Services\WordPress\WordPressMigrator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use ZipArchive;

class AdminController extends Controller
{
    protected WordPressMigrator $migrator;

    public function __construct(WordPressMigrator $migrator)
    {
        $this->migrator = $migrator;
    }

    /**
     * Check authorization for the given site
     */
    protected function authorizeSite(Request $request, string $siteSlug, string $minRole = 'editor'): Site
    {
        $user = $request->user();
        if (!$user) {
            abort(401, 'Yetkisiz erişim.');
        }

        $site = Site::where('slug', $siteSlug)->firstOrFail();

        if ($user->is_super_admin) {
            return $site;
        }

        $role = $user->getRoleForSite($site->id);
        if (!$role) {
            abort(403, 'Bu domain için erişim yetkiniz bulunmuyor.');
        }

        if ($minRole === 'admin' && $role !== 'admin') {
            abort(403, 'Bu işlem için Admin yetkisi gereklidir (Mevcut rolünüz: Editör).');
        }

        return $site;
    }

    /**
     * Site Dashboard Summary Stats
     */
    public function dashboard(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'editor');
        $user = $request->user();

        $stats = [
            'site' => [
                'name' => $site->name,
                'slug' => $site->slug,
                'domain' => $site->domain,
            ],
            'userRole' => $user->is_super_admin ? 'admin' : $user->getRoleForSite($site->id),
            'pagesCount' => Page::where('site_id', $site->id)->count(),
            'postsCount' => Post::where('site_id', $site->id)->count(),
            'formsCount' => Form::where('site_id', $site->id)->count(),
            'submissionsCount' => FormSubmission::where('site_id', $site->id)->count(),
            'mediaCount' => Media::where('site_id', $site->id)->count(),
            'recentSubmissions' => FormSubmission::where('site_id', $site->id)
                ->with('form')
                ->latest()
                ->take(5)
                ->get(),
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }

    // ==========================================
    // 1. PAGES CRUD
    // ==========================================
    public function listPages(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'editor');
        $pages = Page::where('site_id', $site->id)->latest()->get();
        return response()->json(['success' => true, 'pages' => $pages]);
    }

    public function createPage(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'editor');

        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'is_home' => 'boolean',
        ]);

        $slug = Str::slug($request->input('slug') ?: $request->input('title'));

        $page = Page::create([
            'site_id' => $site->id,
            'title' => $request->input('title'),
            'slug' => $slug,
            'is_home' => $request->boolean('is_home'),
            'layout' => [
                [
                    'id' => 'sec_' . uniqid(),
                    'type' => 'Section',
                    'props' => ['layout' => 'boxed'],
                    'styles' => ['padding' => '60px 20px'],
                    'children' => [
                        [
                            'id' => 'h_' . uniqid(),
                            'type' => 'Heading',
                            'props' => ['text' => $request->input('title'), 'level' => 'h1', 'align' => 'center'],
                        ],
                    ],
                ],
            ],
            'seo' => [
                'title' => $request->input('title') . ' | ' . $site->name,
                'description' => '',
            ],
            'status' => 'published',
        ]);

        return response()->json(['success' => true, 'page' => $page]);
    }

    public function deletePage(Request $request, string $siteSlug, int $pageId): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'admin');
        $page = Page::where('site_id', $site->id)->where('id', $pageId)->firstOrFail();
        $page->delete();
        return response()->json(['success' => true, 'message' => 'Sayfa silindi.']);
    }

    // ==========================================
    // 2. POSTS / BLOG CRUD
    // ==========================================
    public function listPosts(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'editor');
        $posts = Post::where('site_id', $site->id)->latest()->get();
        return response()->json(['success' => true, 'posts' => $posts]);
    }

    public function createPost(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'editor');

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
        ]);

        $post = Post::create([
            'site_id' => $site->id,
            'title' => $request->input('title'),
            'slug' => Str::slug($request->input('title')),
            'excerpt' => $request->input('excerpt', ''),
            'content' => $request->input('content'),
            'published_at' => now(),
            'status' => 'published',
        ]);

        return response()->json(['success' => true, 'post' => $post]);
    }

    public function updatePost(Request $request, string $siteSlug, int $postId): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'editor');
        $post = Post::where('site_id', $site->id)->where('id', $postId)->firstOrFail();

        $post->update($request->only(['title', 'content', 'excerpt', 'status']));
        return response()->json(['success' => true, 'post' => $post]);
    }

    public function deletePost(Request $request, string $siteSlug, int $postId): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'admin');
        $post = Post::where('site_id', $site->id)->where('id', $postId)->firstOrFail();
        $post->delete();
        return response()->json(['success' => true, 'message' => 'Yazı silindi.']);
    }

    // ==========================================
    // 3. FORMS & SUBMISSIONS
    // ==========================================
    public function listForms(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'editor');
        $forms = Form::where('site_id', $site->id)->withCount('submissions')->get();
        return response()->json(['success' => true, 'forms' => $forms]);
    }

    public function listSubmissions(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'editor');
        $submissions = FormSubmission::where('site_id', $site->id)
            ->with('form')
            ->latest()
            ->paginate(30);

        return response()->json(['success' => true, 'submissions' => $submissions]);
    }

    // ==========================================
    // 4. MEDIA / GALLERY
    // ==========================================
    public function listMedia(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'editor');
        $media = Media::where('site_id', $site->id)->latest()->get();
        return response()->json(['success' => true, 'media' => $media]);
    }

    public function uploadMedia(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'editor');

        $request->validate([
            'file' => 'required|image|max:10240', // max 10MB
        ]);

        $file = $request->file('file');
        $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("sites/{$site->slug}/media", $filename, 'public');

        $media = Media::create([
            'site_id' => $site->id,
            'filename' => $filename,
            'path' => '/storage/' . $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'alt_text' => $file->getClientOriginalName(),
        ]);

        return response()->json(['success' => true, 'media' => $media]);
    }

    // ==========================================
    // 5. EMAIL / SMTP SETTINGS
    // ==========================================
    public function getEmailSettings(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'admin');
        $settings = $site->settings['smtp'] ?? [
            'host' => '',
            'port' => '587',
            'username' => '',
            'password' => '',
            'encryption' => 'tls',
            'from_address' => '',
            'from_name' => $site->name,
        ];

        return response()->json(['success' => true, 'settings' => $settings]);
    }

    public function updateEmailSettings(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'admin');

        $currentSettings = $site->settings ?? [];
        $currentSettings['smtp'] = $request->input('smtp', []);

        $site->settings = $currentSettings;
        $site->save();

        return response()->json([
            'success' => true,
            'message' => 'E-posta / SMTP ayarları başarıyla güncellendi.',
        ]);
    }

    // ==========================================
    // 6. WORDPRESS IMPORTER
    // ==========================================
    public function importWordPress(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'admin');

        $wpDbName = $request->input('wp_db');
        $prefix = $request->input('prefix', 'wp_');

        // Check if an SQL dump file was uploaded via browser
        if ($request->hasFile('dump_file')) {
            $uploadedFile = $request->file('dump_file');
            $ext = strtolower($uploadedFile->getClientOriginalExtension());
            $tempDb = 'wp_imp_' . uniqid();

            // Create temporary DB
            DB::statement("CREATE DATABASE IF NOT EXISTS `{$tempDb}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

            if ($ext === 'zip') {
                $zip = new ZipArchive();
                if ($zip->open($uploadedFile->getRealPath()) === true) {
                    $sqlContent = '';
                    for ($i = 0; $i < $zip->numFiles; $i++) {
                        $name = $zip->getNameIndex($i);
                        if (str_ends_with(strtolower($name), '.sql')) {
                            $sqlContent = $zip->getFromIndex($i);
                            break;
                        }
                    }
                    $zip->close();

                    if (!empty($sqlContent)) {
                        $pdo = new \PDO(
                            "mysql:host=" . env('DB_HOST', 'db') . ";dbname={$tempDb};charset=utf8mb4",
                            env('DB_USERNAME', 'openappengine'),
                            env('DB_PASSWORD', 'openappenginesecure')
                        );
                        $pdo->exec($sqlContent);
                    }
                }
            } elseif ($ext === 'sql') {
                $sqlContent = file_get_contents($uploadedFile->getRealPath());
                $pdo = new \PDO(
                    "mysql:host=" . env('DB_HOST', 'db') . ";dbname={$tempDb};charset=utf8mb4",
                    env('DB_USERNAME', 'openappengine'),
                    env('DB_PASSWORD', 'openappenginesecure')
                );
                $pdo->exec($sqlContent);
            }

            $wpDbName = $tempDb;
        }

        if (empty($wpDbName)) {
            return response()->json([
                'success' => false,
                'message' => 'Lütfen bir SQL/Zip dump dosyası yükleyin veya veritabanı adını belirtin.',
            ], 422);
        }

        try {
            $stats = $this->migrator->migrate($site->slug, $wpDbName, $prefix);

            return response()->json([
                'success' => true,
                'message' => 'WordPress verileri başarıyla içe aktarıldı!',
                'stats' => $stats,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'İçe aktarma sırasında hata oluştu: ' . $e->getMessage(),
            ], 500);
        }
    }
}
