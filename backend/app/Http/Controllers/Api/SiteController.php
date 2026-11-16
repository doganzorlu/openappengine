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
}
