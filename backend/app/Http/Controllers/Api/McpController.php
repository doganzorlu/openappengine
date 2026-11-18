<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Site;
use App\Models\Page;
use App\Models\Post;
use App\Models\Form;
use App\Models\FormSubmission;
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
                'list_sites' => $this->toolListSites($args),
                'get_site_details' => $this->toolGetSiteDetails($args),
                'update_site_theme' => $this->toolUpdateSiteTheme($args),
                'list_pages' => $this->toolListPages($args),
                'get_page_layout' => $this->toolGetPageLayout($args),
                'update_page_layout' => $this->toolUpdatePageLayout($args),
                'list_posts' => $this->toolListPosts($args),
                'create_post' => $this->toolCreatePost($args),
                'list_submissions' => $this->toolListSubmissions($args),
                'update_submission_status' => $this->toolUpdateSubmissionStatus($args),
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
        if (!empty($args['font_family'])) {
            $site->theme_config = array_merge($site->theme_config ?? [], ['font_family' => $args['font_family']]);
        }

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

    private function getToolsSchema(): array
    {
        return [
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
                    'properties' => ['site_slug' => ['type' => 'string', 'description' => 'Slug of the site (e.g. otizmuzikokulu)']],
                    'required' => ['site_slug'],
                ],
            ],
            [
                'name' => 'update_site_theme',
                'description' => 'Update the primary brand color, secondary color, or typography font family of a site',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'site_slug' => ['type' => 'string'],
                        'primary_color' => ['type' => 'string', 'description' => 'Hex color code (e.g. #0077b6)'],
                        'secondary_color' => ['type' => 'string', 'description' => 'Hex color code'],
                        'font_family' => ['type' => 'string', 'description' => 'CSS font family name'],
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
        ];
    }
}
