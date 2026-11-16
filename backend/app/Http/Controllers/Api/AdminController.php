<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Media;
use App\Models\Page;
use App\Models\Post;
use App\Models\Site;
use App\Models\User;
use App\Services\WordPress\WordPressMigrator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
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

    // ==========================================
    // 7. TENANTS (SITES) MANAGEMENT (SUPER ADMIN)
    // ==========================================
    public function listTenants(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            abort(401, 'Yetkisiz erişim.');
        }

        $query = Site::with(['users' => function ($q) {
            $q->select(['users.id', 'users.name', 'users.user_code', 'users.email']);
        }])
        ->withCount(['pages', 'posts', 'forms']);

        if (!$user->is_super_admin) {
            $siteIds = $user->sites()->pluck('sites.id');
            $query->whereIn('id', $siteIds);
        }

        $tenants = $query->latest()->get()->map(function ($site) {
            return [
                'id' => $site->id,
                'name' => $site->name,
                'slug' => $site->slug,
                'domain' => $site->domain,
                'description' => $site->description,
                'status' => $site->status,
                'primary_color' => $site->theme_config['primary_color'] ?? '#4F46E5',
                'logo_url' => $site->settings['logo_url'] ?? $site->theme_config['logo_url'] ?? null,
                'pages_count' => $site->pages_count,
                'posts_count' => $site->posts_count,
                'forms_count' => $site->forms_count,
                'users' => $site->users->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'user_code' => $u->user_code,
                        'email' => $u->email,
                        'role' => $u->pivot->role,
                    ];
                }),
                'created_at' => $site->created_at?->format('d.m.Y H:i'),
            ];
        });

        return response()->json([
            'success' => true,
            'tenants' => $tenants,
            'is_super_admin' => (bool) $user->is_super_admin,
        ]);
    }

    public function createTenant(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->is_super_admin) {
            abort(403, 'Sadece sistem yöneticisi (Super Admin) yeni tenant oluşturabilir.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:sites,slug',
            'domain' => 'required|string|max:255|unique:sites,domain',
            'description' => 'nullable|string',
            'primary_color' => 'nullable|string|max:50',
            'admin_user_code' => 'nullable|string|max:100',
            'admin_name' => 'nullable|string|max:255',
            'admin_email' => 'nullable|email|max:255',
            'admin_password' => 'nullable|string|min:6',
        ]);

        $name = trim($request->input('name'));
        $slug = Str::slug($request->input('slug') ?: $name);
        $domain = trim($request->input('domain'));
        $description = $request->input('description', '');
        $primaryColor = $request->input('primary_color', '#4F46E5');

        // Create Site / Tenant
        $site = Site::create([
            'name' => $name,
            'slug' => $slug,
            'domain' => $domain,
            'description' => $description,
            'status' => 'active',
            'settings' => [
                'original_home' => "https://{$domain}",
                'original_siteurl' => "https://{$domain}",
            ],
            'theme_config' => [
                'primary_color' => $primaryColor,
                'font_family' => 'Roboto, sans-serif',
            ],
        ]);

        // Create default modern responsive Homepage
        Page::create([
            'site_id' => $site->id,
            'title' => 'Ana Sayfa',
            'slug' => 'ana-sayfa',
            'is_home' => true,
            'status' => 'published',
            'seo' => [
                'title' => "{$name} | Resmi Web Sitesi",
                'description' => $description,
            ],
            'layout' => [
                [
                    'id' => 'hero_' . uniqid(),
                    'type' => 'Section',
                    'props' => [
                        'minHeight' => 480,
                        'bgColor' => '#0F172A',
                        'shapeDividerBottom' => [
                            'shape' => 'mountains',
                            'color' => '#ffffff',
                            'height' => 57,
                        ],
                    ],
                    'styles' => [
                        'padding' => '80px 20px 100px 20px',
                    ],
                    'children' => [
                        [
                            'id' => 'col_' . uniqid(),
                            'type' => 'Column',
                            'props' => ['width' => 100, 'align' => 'center'],
                            'styles' => [],
                            'children' => [
                                [
                                    'id' => 'h_' . uniqid(),
                                    'type' => 'Heading',
                                    'props' => [
                                        'text' => $name,
                                        'level' => 'h1',
                                        'align' => 'center',
                                        'color' => '#FFFFFF',
                                    ],
                                    'styles' => [],
                                ],
                                [
                                    'id' => 't_' . uniqid(),
                                    'type' => 'RichText',
                                    'props' => [
                                        'html' => '<p class="text-lg text-slate-300 max-w-2xl mx-auto my-4 text-center">' . htmlspecialchars($description ?: 'Yeni nesil dijital platform ve web deneyimi.') . '</p>',
                                        'align' => 'center',
                                        'color' => '#CBD5E1',
                                    ],
                                    'styles' => [],
                                ],
                                [
                                    'id' => 'b_' . uniqid(),
                                    'type' => 'Button',
                                    'props' => [
                                        'text' => 'İletişime Geçin',
                                        'url' => '#iletisim',
                                        'align' => 'center',
                                        'bgColor' => $primaryColor,
                                        'color' => '#FFFFFF',
                                    ],
                                    'styles' => [],
                                ],
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'feat_' . uniqid(),
                    'type' => 'Section',
                    'props' => ['layout' => 'boxed'],
                    'styles' => ['padding' => '60px 20px'],
                    'children' => [
                        [
                            'id' => 'ib1_' . uniqid(),
                            'type' => 'IconBox',
                            'props' => [
                                'title' => 'Yenilikçi Yaklaşım',
                                'description' => 'Modern ve yüksek performanslı dijital altyapı.',
                                'icon' => 'fas fa-rocket',
                                'iconColor' => $primaryColor,
                            ],
                            'styles' => [],
                        ],
                        [
                            'id' => 'ib2_' . uniqid(),
                            'type' => 'IconBox',
                            'props' => [
                                'title' => 'Topluluk & Dayanışma',
                                'description' => 'Tüm paydaşları bir araya getiren güçlü iletişim ağı.',
                                'icon' => 'fas fa-users',
                                'iconColor' => $primaryColor,
                            ],
                            'styles' => [],
                        ],
                        [
                            'id' => 'ib3_' . uniqid(),
                            'type' => 'IconBox',
                            'props' => [
                                'title' => 'Güvenli & Hızlı',
                                'description' => 'Tam erişilebilirlik ve kesintisiz hizmet garantisi.',
                                'icon' => 'fas fa-shield-alt',
                                'iconColor' => $primaryColor,
                            ],
                            'styles' => [],
                        ],
                    ],
                ],
                [
                    'id' => 'sec_form_' . uniqid(),
                    'type' => 'Section',
                    'props' => ['layout' => 'boxed'],
                    'styles' => ['padding' => '60px 20px', 'backgroundColor' => '#F8FAFC'],
                    'children' => [
                        [
                            'id' => 'f_head_' . uniqid(),
                            'type' => 'Heading',
                            'props' => [
                                'text' => 'Bizimle İletişime Geçin',
                                'level' => 'h2',
                                'align' => 'center',
                            ],
                            'styles' => [],
                        ],
                        [
                            'id' => 'form_' . uniqid(),
                            'type' => 'ContactForm',
                            'props' => [
                                'formId' => 'iletisim-formu',
                                'title' => 'Mesaj Gönderin',
                                'buttonText' => 'Gönder',
                            ],
                            'styles' => [],
                        ],
                    ],
                ],
            ],
        ]);

        // Attach super admin to this new site as admin
        $site->users()->syncWithoutDetaching([$user->id => ['role' => 'admin']]);

        // Optional: Create dedicated Tenant Admin user
        $createdUser = null;
        $adminUserCode = trim($request->input('admin_user_code') ?: '');
        $adminPassword = $request->input('admin_password');

        if (!empty($adminUserCode) && !empty($adminPassword)) {
            $adminEmail = trim($request->input('admin_email') ?: "{$adminUserCode}@{$domain}");
            $adminName = trim($request->input('admin_name') ?: "{$name} Yöneticisi");

            $tenantAdmin = User::updateOrCreate(
                ['user_code' => $adminUserCode],
                [
                    'name' => $adminName,
                    'email' => $adminEmail,
                    'password' => Hash::make($adminPassword),
                    'is_super_admin' => false,
                ]
            );

            $site->users()->syncWithoutDetaching([$tenantAdmin->id => ['role' => 'admin']]);

            $createdUser = [
                'user_code' => $tenantAdmin->user_code,
                'email' => $tenantAdmin->email,
                'name' => $tenantAdmin->name,
                'role' => 'admin',
            ];
        }

        return response()->json([
            'success' => true,
            'message' => "Tenant [{$name}] başarıyla oluşturuldu.",
            'tenant' => [
                'id' => $site->id,
                'name' => $site->name,
                'slug' => $site->slug,
                'domain' => $site->domain,
            ],
            'admin_user' => $createdUser,
        ], 201);
    }

    public function updateTenant(Request $request, int $siteId): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->is_super_admin) {
            abort(403, 'Sadece sistem yöneticisi tenant güncelleyebilir.');
        }

        $site = Site::findOrFail($siteId);

        $request->validate([
            'name' => 'required|string|max:255',
            'domain' => "required|string|max:255|unique:sites,domain,{$site->id}",
            'description' => 'nullable|string',
            'status' => 'required|in:active,draft,archived',
            'primary_color' => 'nullable|string|max:50',
        ]);

        $site->name = trim($request->input('name'));
        $site->domain = trim($request->input('domain'));
        $site->description = $request->input('description', '');
        $site->status = $request->input('status');

        if ($request->filled('primary_color')) {
            $tc = $site->theme_config ?? [];
            $tc['primary_color'] = $request->input('primary_color');
            $site->theme_config = $tc;
        }

        $site->save();

        return response()->json([
            'success' => true,
            'message' => 'Tenant bilgileri başarıyla güncellendi.',
        ]);
    }

    public function deleteTenant(Request $request, int $siteId): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->is_super_admin) {
            abort(403, 'Sadece sistem yöneticisi tenant silebilir.');
        }

        $site = Site::findOrFail($siteId);
        $name = $site->name;

        // Cascade delete pages, posts, forms, media
        $site->pages()->delete();
        $site->posts()->delete();
        $site->forms()->delete();
        $site->media()->delete();
        $site->users()->detach();
        $site->delete();

        return response()->json([
            'success' => true,
            'message' => "[{$name}] tenantı ve bağlı tüm verileri başarıyla silindi.",
        ]);
    }

    public function assignTenantUser(Request $request, int $siteId): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->is_super_admin) {
            abort(403, 'Yetkisiz işlem.');
        }

        $site = Site::findOrFail($siteId);

        $request->validate([
            'user_code' => 'required|string',
            'role' => 'required|in:admin,editor',
            'name' => 'nullable|string',
            'password' => 'nullable|string|min:6',
        ]);

        $userCode = trim($request->input('user_code'));
        $targetUser = User::where('user_code', $userCode)
            ->orWhere('email', $userCode)
            ->first();

        if (!$targetUser) {
            if (!$request->filled('password')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Yeni kullanıcı için parola zorunludur.',
                ], 422);
            }

            $targetUser = User::create([
                'user_code' => $userCode,
                'email' => str_contains($userCode, '@') ? $userCode : "{$userCode}@{$site->domain}",
                'name' => $request->input('name') ?: $userCode,
                'password' => Hash::make($request->input('password')),
                'is_super_admin' => false,
            ]);
        }

        $site->users()->syncWithoutDetaching([
            $targetUser->id => ['role' => $request->input('role')],
        ]);

        return response()->json([
            'success' => true,
            'message' => "Kullanıcı [{$targetUser->user_code}] bu tenant'a [{$request->input('role')}] olarak atandı.",
        ]);
    }

    public function removeTenantUser(Request $request, int $siteId, int $userId): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->is_super_admin) {
            abort(403, 'Yetkisiz işlem.');
        }

        $site = Site::findOrFail($siteId);
        $site->users()->detach($userId);

        return response()->json([
            'success' => true,
            'message' => 'Kullanıcının tenant erişimi kaldırıldı.',
        ]);
    }

    // ==========================================
    // 8. SITE GENERAL SETTINGS & IDENTITY (TENANT ADMIN)
    // ==========================================
    public function getSiteGeneralSettings(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'editor');

        return response()->json([
            'success' => true,
            'site' => [
                'id' => $site->id,
                'name' => $site->name,
                'slug' => $site->slug,
                'domain' => $site->domain,
                'description' => $site->description,
                'status' => $site->status,
                'primary_color' => $site->theme_config['primary_color'] ?? '#4F46E5',
                'logo_url' => $site->settings['logo_url'] ?? $site->theme_config['logo_url'] ?? '',
                'seo_title' => $site->settings['seo_title'] ?? $site->name,
                'seo_description' => $site->settings['seo_description'] ?? $site->description,
                'phone' => $site->settings['phone'] ?? '',
                'email' => $site->settings['email'] ?? '',
                'address' => $site->settings['address'] ?? '',
            ],
        ]);
    }

    public function updateSiteGeneralSettings(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'admin');

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'primary_color' => 'nullable|string|max:50',
            'logo_url' => 'nullable|string|max:500',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'phone' => 'nullable|string|max:100',
            'email' => 'nullable|string|max:100',
            'address' => 'nullable|string',
        ]);

        $site->name = trim($request->input('name'));
        $site->description = $request->input('description', '');

        $themeConfig = $site->theme_config ?? [];
        if ($request->filled('primary_color')) {
            $themeConfig['primary_color'] = $request->input('primary_color');
        }
        if ($request->has('logo_url')) {
            $themeConfig['logo_url'] = $request->input('logo_url');
        }
        $site->theme_config = $themeConfig;

        $settings = $site->settings ?? [];
        $settings['logo_url'] = $request->input('logo_url');
        $settings['seo_title'] = $request->input('seo_title');
        $settings['seo_description'] = $request->input('seo_description');
        $settings['phone'] = $request->input('phone');
        $settings['email'] = $request->input('email');
        $settings['address'] = $request->input('address');
        $site->settings = $settings;

        $site->save();

        return response()->json([
            'success' => true,
            'message' => 'Site ayarları başarıyla güncellendi.',
        ]);
    }

    // ==========================================
    // 9. SITE USERS & TEAM (TENANT ADMIN)
    // ==========================================
    public function listSiteUsers(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'admin');

        $users = $site->users()->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'user_code' => $u->user_code,
                'email' => $u->email,
                'role' => $u->pivot->role,
                'is_super_admin' => $u->is_super_admin,
            ];
        });

        return response()->json([
            'success' => true,
            'users' => $users,
        ]);
    }

    public function addSiteUser(Request $request, string $siteSlug): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'admin');

        $request->validate([
            'user_code' => 'required|string',
            'role' => 'required|in:admin,editor',
            'name' => 'nullable|string',
            'password' => 'nullable|string|min:6',
        ]);

        $userCode = trim($request->input('user_code'));
        $targetUser = User::where('user_code', $userCode)
            ->orWhere('email', $userCode)
            ->first();

        if (!$targetUser) {
            if (!$request->filled('password')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Yeni kullanıcı oluşturmak için parola zorunludur.',
                ], 422);
            }

            $targetUser = User::create([
                'user_code' => $userCode,
                'email' => str_contains($userCode, '@') ? $userCode : "{$userCode}@{$site->domain}",
                'name' => $request->input('name') ?: $userCode,
                'password' => Hash::make($request->input('password')),
                'is_super_admin' => false,
            ]);
        }

        $site->users()->syncWithoutDetaching([
            $targetUser->id => ['role' => $request->input('role')],
        ]);

        return response()->json([
            'success' => true,
            'message' => "Kullanıcı [{$targetUser->user_code}] bu siteye [{$request->input('role')}] olarak eklendi.",
        ]);
    }

    public function removeSiteUser(Request $request, string $siteSlug, int $userId): JsonResponse
    {
        $site = $this->authorizeSite($request, $siteSlug, 'admin');
        $site->users()->detach($userId);

        return response()->json([
            'success' => true,
            'message' => 'Kullanıcının site erişimi kaldırıldı.',
        ]);
    }
}
