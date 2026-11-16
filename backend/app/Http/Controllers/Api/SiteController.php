<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Page;
use App\Models\Site;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteController extends Controller
{
    /**
     * List all active sites
     */
    public function index(): JsonResponse
    {
        $sites = Site::where('status', 'active')
            ->select(['id', 'name', 'slug', 'domain', 'description'])
            ->get();

        return response()->json(['sites' => $sites]);
    }

    /**
     * Resolve site dynamically by hostname or query slug
     */
    public function resolve(Request $request): JsonResponse
    {
        $host = $request->query('domain') ?: $request->getHost();
        // Remove port if present
        $host = explode(':', $host)[0];

        $site = null;
        if (!in_array($host, ['localhost', '127.0.0.1'])) {
            $site = Site::where('domain', $host)
                ->orWhere('domain', 'like', "%{$host}%")
                ->orWhere('slug', $host)
                ->first();
        }

        if (!$site) {
            $fallbackSlug = $request->query('site', 'berilzorlu');
            $site = Site::where('slug', $fallbackSlug)->first() ?? Site::firstOrFail();
        }

        return $this->show($site->slug);
    }

    /**
     * Get site config, theme, and menus
     */
    public function show(string $siteSlug): JsonResponse
    {
        $site = Site::where('slug', $siteSlug)
            ->with(['menus.items'])
            ->firstOrFail();

        return response()->json([
            'site' => [
                'id' => $site->id,
                'name' => $site->name,
                'slug' => $site->slug,
                'domain' => $site->domain,
                'description' => $site->description,
                'settings' => $site->settings,
                'theme_config' => $site->theme_config,
            ],
            'menus' => $site->menus->map(function ($menu) {
                return [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'location' => $menu->location,
                    'items' => $menu->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'title' => $item->title,
                            'url' => $item->url,
                            'target' => $item->target,
                        ];
                    }),
                ];
            }),
        ]);
    }

    /**
     * Get page by slug or homepage
     */
    public function page(string $siteSlug, ?string $pageSlug = null): JsonResponse
    {
        $site = Site::where('slug', $siteSlug)->firstOrFail();

        $query = Page::where('site_id', $site->id);

        if ($pageSlug) {
            $page = $query->where('slug', $pageSlug)->firstOrFail();
        } else {
            $page = $query->where('is_home', true)->first() 
                ?? $query->firstOrFail();
        }

        return response()->json([
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'is_home' => $page->is_home,
                'seo' => $page->seo,
                'layout' => $page->layout,
            ],
        ]);
    }

    /**
     * Handle form submission
     */
    public function submitForm(Request $request, string $siteSlug, string $formSlug): JsonResponse
    {
        $site = Site::where('slug', $siteSlug)->firstOrFail();
        $form = Form::where('site_id', $site->id)
            ->where('slug', $formSlug)
            ->firstOrFail();

        $submission = FormSubmission::create([
            'site_id' => $site->id,
            'form_id' => $form->id,
            'data' => $request->all(),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mesajınız başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.',
            'submission_id' => $submission->id,
        ]);
    }

    /**
     * List pages of a site
     */
    public function pages(string $siteSlug): JsonResponse
    {
        $site = Site::where('slug', $siteSlug)->firstOrFail();
        $pages = Page::where('site_id', $site->id)
            ->select(['id', 'title', 'slug', 'is_home'])
            ->get();

        return response()->json(['pages' => $pages]);
    }

    /**
     * Update page layout from the visual editor
     */
    public function updateLayout(Request $request, string $siteSlug, int $pageId): JsonResponse
    {
        $site = Site::where('slug', $siteSlug)->firstOrFail();
        $page = Page::where('site_id', $site->id)->where('id', $pageId)->firstOrFail();

        $request->validate([
            'layout' => 'present|array',
        ]);

        $page->layout = $request->input('layout');
        $page->save();

        return response()->json([
            'success' => true,
            'message' => 'Sayfa düzeni başarıyla güncellendi.',
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'layout' => $page->layout,
            ],
        ]);
    }
}
