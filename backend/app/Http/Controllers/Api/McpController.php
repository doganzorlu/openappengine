<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Site;
use App\Models\Page;
use App\Models\Post;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Services\ComponentCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class McpController extends Controller
{
    /**
     * Return list of MCP Tools available to AI agents
     */
    public function tools(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'tools' => $this->getToolsSchema(),
        ]);
    }

    /**
     * Handle MCP Tool Call via HTTP JSON-RPC
     */
    public function handle(Request $request): JsonResponse
    {
        $tool = $request->input('name') ?? $request->input('tool');
        $args = $request->input('arguments') ?? $request->input('args') ?? [];

        if (!$tool) {
            return response()->json(['success' => false, 'error' => 'Tool name is required'], 400);
        }

        try {
            $result = match ($tool) {
                'get_component_catalog' => $this->toolGetComponentCatalog($args),
                'get_site_structure' => $this->toolGetSiteStructure($args),
                'list_sites' => $this->toolListSites($args),
                'get_site_details' => $this->toolGetSiteDetails($args),
                'update_site_theme' => $this->toolUpdateSiteTheme($args),
                'list_pages' => $this->toolListPages($args),
                'create_page' => $this->toolCreatePage($args),
                'delete_page' => $this->toolDeletePage($args),
                'get_page_layout' => $this->toolGetPageLayout($args),
                'update_page_layout' => $this->toolUpdatePageLayout($args),
                'add_page_section' => $this->toolAddPageSection($args),
                'list_menus' => $this->toolListMenus($args),
                'update_menu' => $this->toolUpdateMenu($args),
                'list_posts' => $this->toolListPosts($args),
                'create_post' => $this->toolCreatePost($args),
                'list_submissions' => $this->toolListSubmissions($args),
                'update_submission_status' => $this->toolUpdateSubmissionStatus($args),
                'get_cookie_settings' => $this->toolGetCookieSettings($args),
                'update_cookie_settings' => $this->toolUpdateCookieSettings($args),
                default => throw new \Exception("Unknown tool: {$tool}"),
            };

            return response()->json([
                'success' => true,
                'tool' => $tool,
                'result' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'tool' => $tool,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function toolGetComponentCatalog(array $args): array
    {
        return ComponentCatalog::getCatalog();
    }

    private function toolGetSiteStructure(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $site = Site::where('slug', $slug)->firstOrFail();

        $pages = Page::where('site_id', $site->id)->get(['id', 'title', 'slug', 'is_home'])->toArray();
        $menus = Menu::where('site_id', $site->id)->with('items')->get()->toArray();
        $forms = Form::where('site_id', $site->id)->get(['id', 'name', 'slug'])->toArray();
        $recentPosts = Post::where('site_id', $site->id)->latest()->limit(5)->get(['id', 'title', 'slug'])->toArray();

        return [
            'site' => [
                'id' => $site->id,
                'name' => $site->name,
                'slug' => $site->slug,
                'domain' => $site->domain,
                'theme' => $site->theme_config,
                'global_colors' => $site->settings['global_colors'] ?? [],
            ],
            'pages' => $pages,
            'menus' => $menus,
            'forms' => $forms,
            'recent_posts' => $recentPosts,
        ];
    }

    private function toolListSites(array $args): array
    {
        return Site::all(['id', 'name', 'slug', 'domain', 'description'])->toArray();
    }

    private function toolGetSiteDetails(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $site = Site::where('slug', $slug)->firstOrFail();
        return [
            'id' => $site->id,
            'name' => $site->name,
            'slug' => $site->slug,
            'domain' => $site->domain,
            'description' => $site->description,
            'theme_config' => $site->theme_config,
            'global_colors' => $site->settings['global_colors'] ?? [],
        ];
    }

    private function toolUpdateSiteTheme(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $site = Site::where('slug', $slug)->firstOrFail();

        $settings = $site->settings ?? [];
        $globalColors = $settings['global_colors'] ?? [];

        if (!empty($args['primary_color'])) {
            $globalColors['primary'] = $args['primary_color'];
            $site->theme_config = array_merge($site->theme_config ?? [], ['primary_color' => $args['primary_color']]);
        }
        if (!empty($args['secondary_color'])) {
            $globalColors['secondary'] = $args['secondary_color'];
        }
        if (!empty($args['accent_color'])) {
            $globalColors['accent'] = $args['accent_color'];
        }
        $themeConfig = $site->theme_config ?? [];

        if (!empty($args['primary_color'])) {
            $themeConfig['primary_color'] = $args['primary_color'];
        }
        if (!empty($args['secondary_color'])) {
            $themeConfig['secondary_color'] = $args['secondary_color'];
        }
        if (!empty($args['accent_color'])) {
            $themeConfig['accent_color'] = $args['accent_color'];
        }
        if (!empty($args['font_family'])) {
            $themeConfig['font_family'] = $args['font_family'];
        }
        if (!empty($args['heading_font_family'])) {
            $themeConfig['heading_font_family'] = $args['heading_font_family'];
        }
        if (isset($args['header_transparent'])) {
            $themeConfig['header_transparent'] = (bool) $args['header_transparent'];
        }
        if (isset($args['sticky_header'])) {
            $themeConfig['sticky_header'] = (bool) $args['sticky_header'];
        }
        if (!empty($args['fonts']) && is_array($args['fonts'])) {
            $themeConfig['fonts'] = array_values(array_unique($args['fonts']));
            $settings['fonts'] = $themeConfig['fonts'];
        }

        $site->theme_config = $themeConfig;
        $settings['global_colors'] = $globalColors;
        $site->settings = $settings;
        $site->save();

        return [
            'message' => "Theme updated for site {$slug}",
            'global_colors' => $globalColors,
            'theme_config' => $site->theme_config,
        ];
    }

    private function toolListPages(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $site = Site::where('slug', $slug)->firstOrFail();
        return Page::where('site_id', $site->id)
            ->get(['id', 'title', 'slug', 'is_home', 'created_at', 'updated_at'])
            ->toArray();
    }

    private function toolCreatePage(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $site = Site::where('slug', $slug)->firstOrFail();

        $title = $args['title'] ?? 'Yeni Sayfa';
        $pageSlug = Str::slug($args['slug'] ?? $title);
        $isHome = !empty($args['is_home']);

        if ($isHome) {
            Page::where('site_id', $site->id)->update(['is_home' => false]);
        }

        $layout = $args['layout'] ?? [
            [
                'id' => 'sec_' . Str::random(6),
                'type' => 'Section',
                'props' => ['layout' => 'boxed', 'minHeight' => '300px', 'alignItems' => 'center', 'justifyContent' => 'center'],
                'styles' => ['padding' => '60px 20px'],
                'children' => [
                    [
                        'id' => 'col_' . Str::random(6),
                        'type' => 'Column',
                        'props' => ['width' => 100, 'align' => 'center'],
                        'children' => [
                            ['id' => 'h_' . Str::random(6), 'type' => 'Heading', 'props' => ['text' => $title, 'level' => 'h1', 'align' => 'center']],
                            ['id' => 'p_' . Str::random(6), 'type' => 'RichText', 'props' => ['html' => '<p>Sayfa içeriğini buradan düzenleyebilirsiniz.</p>', 'align' => 'center']],
                        ]
                    ]
                ]
            ]
        ];

        $page = Page::create([
            'site_id' => $site->id,
            'title' => $title,
            'slug' => $pageSlug,
            'is_home' => $isHome,
            'layout' => $layout,
            'seo' => [
                'title' => $args['seo_title'] ?? $title,
                'description' => $args['seo_description'] ?? "{$site->name} - {$title}",
            ],
            'status' => 'published',
        ]);

        return [
            'message' => "Page '{$page->title}' created successfully",
            'id' => $page->id,
            'slug' => $page->slug,
        ];
    }

    private function toolDeletePage(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $site = Site::where('slug', $slug)->firstOrFail();
        $pageId = $args['page_id'] ?? null;
        $pageSlug = $args['page_slug'] ?? null;

        $query = Page::where('site_id', $site->id);
        if ($pageId) {
            $query->where('id', $pageId);
        } elseif ($pageSlug) {
            $query->where('slug', $pageSlug);
        } else {
            throw new \Exception("page_id or page_slug is required");
        }

        $page = $query->firstOrFail();
        if ($page->is_home) {
            throw new \Exception("Cannot delete the homepage");
        }

        $title = $page->title;
        $page->delete();

        return ['message' => "Page '{$title}' deleted successfully"];
    }

    private function toolGetPageLayout(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $pageSlug = $args['page_slug'] ?? '';
        $site = Site::where('slug', $slug)->firstOrFail();

        $query = Page::where('site_id', $site->id);
        if ($pageSlug) {
            $query->where('slug', $pageSlug);
        } else {
            $query->where('is_home', true);
        }
        $page = $query->firstOrFail();

        return [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'layout' => $page->layout,
        ];
    }

    private function toolUpdatePageLayout(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $pageSlug = $args['page_slug'] ?? '';
        $newLayout = $args['layout'] ?? [];

        if (empty($newLayout)) {
            throw new \Exception("layout parameter is required and cannot be empty");
        }

        $site = Site::where('slug', $slug)->firstOrFail();
        $query = Page::where('site_id', $site->id);
        if ($pageSlug) {
            $query->where('slug', $pageSlug);
        } else {
            $query->where('is_home', true);
        }
        $page = $query->firstOrFail();

        $page->layout = $newLayout;
        $page->save();

        return [
            'message' => "Page '{$page->title}' layout updated successfully by AI Agent",
            'component_count' => count($newLayout),
        ];
    }

    private function toolAddPageSection(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $pageSlug = $args['page_slug'] ?? '';
        $section = $args['section'] ?? null;
        $position = $args['position'] ?? 'bottom'; // top or bottom

        if (!$section) {
            throw new \Exception("section parameter is required");
        }

        $site = Site::where('slug', $slug)->firstOrFail();
        $query = Page::where('site_id', $site->id);
        if ($pageSlug) {
            $query->where('slug', $pageSlug);
        } else {
            $query->where('is_home', true);
        }
        $page = $query->firstOrFail();

        $layout = $page->layout ?? [];
        if ($position === 'top') {
            array_unshift($layout, $section);
        } else {
            $layout[] = $section;
        }

        $page->layout = $layout;
        $page->save();

        return [
            'message' => "Section added successfully to page '{$page->title}'",
            'new_total_sections' => count($layout),
        ];
    }

    private function toolListMenus(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $site = Site::where('slug', $slug)->firstOrFail();
        return Menu::where('site_id', $site->id)->with('items')->get()->toArray();
    }

    private function toolUpdateMenu(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $site = Site::where('slug', $slug)->firstOrFail();
        $menuSlug = $args['menu_location'] ?? 'anamenu';
        $items = $args['items'] ?? [];

        $menu = Menu::firstOrCreate(
            ['site_id' => $site->id, 'location' => $menuSlug],
            ['name' => 'Ana Menü']
        );

        // Replace menu items
        $menu->items()->delete();
        foreach ($items as $idx => $it) {
            MenuItem::create([
                'menu_id' => $menu->id,
                'title' => $it['title'] ?? 'Menü',
                'url' => $it['url'] ?? '#',
                'target' => $it['target'] ?? '_self',
                'sort_order' => $idx + 1,
            ]);
        }

        return [
            'message' => "Menu '{$menuSlug}' updated with " . count($items) . " items",
            'items' => $menu->items()->get()->toArray(),
        ];
    }

    private function toolListPosts(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $site = Site::where('slug', $slug)->firstOrFail();
        return Post::where('site_id', $site->id)
            ->latest()
            ->limit(20)
            ->get(['id', 'title', 'slug', 'excerpt', 'published_at'])
            ->toArray();
    }

    private function toolCreatePost(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $site = Site::where('slug', $slug)->firstOrFail();

        $title = $args['title'] ?? 'Yeni Makale';
        $postSlug = Str::slug($args['slug'] ?? $title);
        $content = $args['content'] ?? '<p>İçerik</p>';
        $excerpt = $args['excerpt'] ?? Str::limit(strip_tags($content), 160);

        $post = Post::create([
            'site_id' => $site->id,
            'title' => $title,
            'slug' => $postSlug,
            'content' => $content,
            'excerpt' => $excerpt,
            'published_at' => now(),
            'meta' => ['author' => 'AI Assistant', 'ai_generated' => true],
        ]);

        return [
            'message' => "Post '{$post->title}' created and published successfully",
            'id' => $post->id,
            'slug' => $post->slug,
        ];
    }

    private function toolListSubmissions(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $site = Site::where('slug', $slug)->firstOrFail();
        $query = FormSubmission::where('site_id', $site->id)->with('form:id,name,slug')->latest();

        if (!empty($args['status'])) {
            $query->where('status', $args['status']);
        }
        if (!empty($args['form_slug'])) {
            $formSlug = $args['form_slug'];
            $query->whereHas('form', fn($q) => $q->where('slug', $formSlug));
        }

        return $query->limit(50)->get()->toArray();
    }

    private function toolUpdateSubmissionStatus(array $args): array
    {
        $subId = $args['submission_id'] ?? null;
        if (!$subId) throw new \Exception("submission_id is required");

        $submission = FormSubmission::findOrFail($subId);
        $newStatus = $args['status'] ?? 'in_review';
        $note = $args['note'] ?? 'AI Agent tarafından güncellendi.';

        $statusLabels = [
            'new' => 'Yeni Alındı',
            'in_review' => 'İnceleniyor',
            'approved' => 'Onaylandı',
            'rejected' => 'Reddedildi',
            'completed' => 'Tamamlandı',
        ];

        $history = $submission->history ?? [];
        $history[] = [
            'status' => $newStatus,
            'label' => $statusLabels[$newStatus] ?? $newStatus,
            'note' => $note,
            'changed_at' => now()->toISOString(),
            'changed_by' => 'OpenAppEngine AI Agent',
        ];

        $submission->status = $newStatus;
        $submission->history = $history;
        $submission->save();

        return [
            'message' => "Submission #{$subId} status updated to {$newStatus}",
            'status' => $newStatus,
            'tracking_token' => $submission->tracking_token,
        ];
    }

    private function toolGetCookieSettings(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $site = Site::where('slug', $slug)->firstOrFail();
        return $site->settings['cookie_consent'] ?? ['enabled' => true, 'position' => 'bottom'];
    }

    private function toolUpdateCookieSettings(array $args): array
    {
        $slug = $args['site_slug'] ?? 'otizmuzikokulu';
        $site = Site::where('slug', $slug)->firstOrFail();
        $settings = $site->settings ?? [];
        $currentCookie = $settings['cookie_consent'] ?? [];
        $settings['cookie_consent'] = array_merge($currentCookie, $args['cookie_consent'] ?? []);
        $site->settings = $settings;
        $site->save();
        return [
            'message' => "Cookie and KVKK settings updated for site {$slug}",
            'cookie_consent' => $site->settings['cookie_consent'],
        ];
    }

    private function getToolsSchema(): array
    {
        return [
            [
                'name' => 'get_component_catalog',
                'description' => 'Get the complete OpenAppEngine design system blueprint, including all 40+ components with their properties, CSS styles, and ready section templates.',
                'inputSchema' => ['type' => 'object', 'properties' => []],
            ],
            [
                'name' => 'get_site_structure',
                'description' => 'Get a comprehensive architectural overview of a site: settings, color palette, navigation menus, pages list, recent posts, and forms.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => ['site_slug' => ['type' => 'string']],
                    'required' => ['site_slug'],
                ],
            ],
            [
                'name' => 'list_sites',
                'description' => 'List all websites and tenants managed in OpenAppEngine',
                'inputSchema' => ['type' => 'object', 'properties' => []],
            ],
            [
                'name' => 'get_site_details',
                'description' => 'Get full details, domain, and global color theme of a specific site',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => ['site_slug' => ['type' => 'string']],
                    'required' => ['site_slug'],
                ],
            ],
            [
                'name' => 'update_site_theme',
                'description' => 'Update typography, colors, navigation header appearance (transparent/sticky), and loaded fonts for a site. Essential for achieving 100% visual parity when cloning websites.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'site_slug' => ['type' => 'string'],
                        'primary_color' => ['type' => 'string', 'description' => 'Primary brand color hex code (e.g. #0a0a0a)'],
                        'secondary_color' => ['type' => 'string', 'description' => 'Secondary accent color hex code (e.g. #c5a880)'],
                        'accent_color' => ['type' => 'string', 'description' => 'Accent color hex code'],
                        'font_family' => ['type' => 'string', 'description' => 'Body text font family (e.g. "Syne, sans-serif" or "Inter, sans-serif")'],
                        'heading_font_family' => ['type' => 'string', 'description' => 'Headline/title font family (e.g. Playfair Display, serif)'],
                        'fonts' => [
                            'type' => 'array',
                            'items' => ['type' => 'string'],
                            'description' => 'List of Google Font names to load dynamically in frontend (e.g. ["Playfair Display", "Syne", "Lexend Deca"])',
                        ],
                        'header_transparent' => [
                            'type' => 'boolean',
                            'description' => 'Set to true if hero section begins beneath a transparent floating navbar',
                        ],
                        'sticky_header' => [
                            'type' => 'boolean',
                            'description' => 'Set to true if navigation bar should stick fixed to the top on scroll',
                        ],
                    ],
                    'required' => ['site_slug'],
                ],
            ],
            [
                'name' => 'list_pages',
                'description' => 'List all pages of a specific website',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => ['site_slug' => ['type' => 'string']],
                    'required' => ['site_slug'],
                ],
            ],
            [
                'name' => 'create_page',
                'description' => 'Create a brand new page with slug, title, SEO tags and initial layout',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'site_slug' => ['type' => 'string'],
                        'title' => ['type' => 'string'],
                        'slug' => ['type' => 'string'],
                        'is_home' => ['type' => 'boolean'],
                        'seo_title' => ['type' => 'string'],
                        'seo_description' => ['type' => 'string'],
                        'layout' => ['type' => 'array', 'description' => 'Optional custom initial ComponentNode array'],
                    ],
                    'required' => ['site_slug', 'title'],
                ],
            ],
            [
                'name' => 'delete_page',
                'description' => 'Delete an existing page (homepage cannot be deleted)',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'site_slug' => ['type' => 'string'],
                        'page_id' => ['type' => 'integer'],
                        'page_slug' => ['type' => 'string'],
                    ],
                    'required' => ['site_slug'],
                ],
            ],
            [
                'name' => 'get_page_layout',
                'description' => 'Get the complete component tree JSON layout of a page to inspect or modify',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'site_slug' => ['type' => 'string'],
                        'page_slug' => ['type' => 'string', 'description' => 'Page slug (leave empty for homepage)'],
                    ],
                    'required' => ['site_slug'],
                ],
            ],
            [
                'name' => 'update_page_layout',
                'description' => 'Save an updated component tree JSON layout for a page in visual editor',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'site_slug' => ['type' => 'string'],
                        'page_slug' => ['type' => 'string'],
                        'layout' => ['type' => 'array', 'description' => 'The complete updated ComponentNode array'],
                    ],
                    'required' => ['site_slug', 'layout'],
                ],
            ],
            [
                'name' => 'add_page_section',
                'description' => 'Append or prepend a new section component node to an existing page',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'site_slug' => ['type' => 'string'],
                        'page_slug' => ['type' => 'string'],
                        'section' => ['type' => 'object', 'description' => 'The Section ComponentNode object'],
                        'position' => ['type' => 'string', 'enum' => ['top', 'bottom'], 'default' => 'bottom'],
                    ],
                    'required' => ['site_slug', 'section'],
                ],
            ],
            [
                'name' => 'list_menus',
                'description' => 'List all navigation menus and menu items of a site',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => ['site_slug' => ['type' => 'string']],
                    'required' => ['site_slug'],
                ],
            ],
            [
                'name' => 'update_menu',
                'description' => 'Update or replace the navigation links in a menu (e.g. anamenu)',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'site_slug' => ['type' => 'string'],
                        'menu_location' => ['type' => 'string', 'default' => 'anamenu'],
                        'items' => [
                            'type' => 'array',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'title' => ['type' => 'string'],
                                    'url' => ['type' => 'string'],
                                    'target' => ['type' => 'string', 'default' => '_self'],
                                ],
                                'required' => ['title', 'url'],
                            ],
                        ],
                    ],
                    'required' => ['site_slug', 'items'],
                ],
            ],
            [
                'name' => 'list_posts',
                'description' => 'List recent news, announcements and blog articles of a site',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => ['site_slug' => ['type' => 'string']],
                    'required' => ['site_slug'],
                ],
            ],
            [
                'name' => 'create_post',
                'description' => 'Draft and publish a new news article or blog post',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'site_slug' => ['type' => 'string'],
                        'title' => ['type' => 'string'],
                        'content' => ['type' => 'string', 'description' => 'HTML content of the post'],
                        'excerpt' => ['type' => 'string'],
                    ],
                    'required' => ['site_slug', 'title', 'content'],
                ],
            ],
            [
                'name' => 'list_submissions',
                'description' => 'Query form submissions, pre-registrations and leads with optional status or form filter',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'site_slug' => ['type' => 'string'],
                        'status' => ['type' => 'string', 'enum' => ['new', 'in_review', 'approved', 'rejected', 'completed']],
                        'form_slug' => ['type' => 'string'],
                    ],
                    'required' => ['site_slug'],
                ],
            ],
            [
                'name' => 'update_submission_status',
                'description' => 'Advance or change the workflow pipeline status of an application and append an audit note',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'submission_id' => ['type' => 'integer'],
                        'status' => ['type' => 'string', 'enum' => ['new', 'in_review', 'approved', 'rejected', 'completed']],
                        'note' => ['type' => 'string'],
                    ],
                    'required' => ['submission_id', 'status'],
                ],
            ],
            [
                'name' => 'get_cookie_settings',
                'description' => 'Get the site-wide Cookie & KVKK policy and consent banner configuration',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'site_slug' => ['type' => 'string'],
                    ],
                    'required' => ['site_slug'],
                ],
            ],
            [
                'name' => 'update_cookie_settings',
                'description' => 'Update the site-wide Cookie & KVKK consent banner, categories, and policy text',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'site_slug' => ['type' => 'string'],
                        'cookie_consent' => [
                            'type' => 'object',
                            'description' => 'Cookie consent config including enabled, position, title, message, and policy_content',
                        ],
                    ],
                    'required' => ['site_slug', 'cookie_consent'],
                ],
            ],
        ];
    }
}
