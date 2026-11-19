<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Page;
use App\Models\Post;
use App\Models\Site;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

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
                $allItems = $menu->items;
                $topItems = $allItems->filter(fn($i) => empty($i->parent_id))->values();
                return [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'location' => $menu->location,
                    'items' => $topItems->map(function ($item) use ($allItems) {
                        $children = $allItems->where('parent_id', $item->id)->values()->map(function ($child) {
                            return [
                                'id' => $child->id,
                                'title' => $child->title,
                                'url' => $child->url,
                                'target' => $child->target,
                            ];
                        });
                        return [
                            'id' => $item->id,
                            'title' => $item->title,
                            'url' => $item->url,
                            'target' => $item->target,
                            'children' => $children,
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
     * Handle form submission and dispatch SMTP notification if configured
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

        $emailSent = false;
        $emailError = null;

        // Dispatch SMTP Notification using this tenant's dedicated SMTP config
        $smtp = $site->settings['smtp'] ?? [];
        if (!empty($smtp['host']) && !empty($smtp['username'])) {
            try {
                Config::set('mail.mailers.tenant_smtp', [
                    'transport' => 'smtp',
                    'host' => $smtp['host'],
                    'port' => (int)($smtp['port'] ?? 587),
                    'encryption' => ($smtp['encryption'] === 'none') ? null : ($smtp['encryption'] ?: 'tls'),
                    'username' => $smtp['username'],
                    'password' => $smtp['password'] ?? '',
                    'timeout' => 15,
                ]);
                Mail::purge('tenant_smtp');

                $fromAddress = !empty($smtp['from_address'])
                    ? $smtp['from_address']
                    : ($smtp['username'] ?? 'noreply@' . ($site->domain ?: 'openappengine.local'));
                $fromName = !empty($smtp['from_name']) ? $smtp['from_name'] : $site->name;

                $recipient = $form->settings['recipient_email'] 
                    ?? $site->settings['contact_email'] 
                    ?? $fromAddress;

                $data = $request->all();
                unset($data['site'], $data['_token']);

                $htmlBody = "<h2>Yeni Form Gönderimi: {$form->name}</h2>";
                $htmlBody .= "<p><strong>Site:</strong> {$site->name} ({$site->domain})</p>";
                $htmlBody .= "<p><strong>Tarih:</strong> " . now()->format('d.m.Y H:i:s') . "</p>";
                $htmlBody .= "<p><strong>IP Adresi:</strong> " . $request->ip() . "</p><hr/>";
                $htmlBody .= "<table border='1' cellpadding='8' style='border-collapse:collapse;font-family:sans-serif;'>";
                foreach ($data as $k => $v) {
                    $val = is_array($v) ? implode(', ', $v) : htmlspecialchars((string)$v);
                    $htmlBody .= "<tr><td style='background:#f3f4f6;'><strong>" . htmlspecialchars(ucfirst($k)) . "</strong></td><td>" . nl2br($val) . "</td></tr>";
                }
                $htmlBody .= "</table>";

                Mail::mailer('tenant_smtp')->html($htmlBody, function ($msg) use ($recipient, $form, $site, $fromAddress, $fromName) {
                    $msg->to($recipient)
                        ->from($fromAddress, $fromName)
                        ->subject("🔔 Yeni İletişim Formu: {$form->name} - {$site->name}");
                });

                $emailSent = true;

                // Workflow Action 1: Auto-responder email to applicant
                $settings = $form->settings ?? [];
                $applicantEmail = $request->input('email') ?? $request->input('e-mail');
                if (!empty($settings['auto_reply_enabled']) && !empty($applicantEmail)) {
                    $replySubject = $settings['auto_reply_subject'] ?: "Başvurunuz Alındı: {$site->name}";
                    $replyMsg = $settings['auto_reply_message'] ?: "Merhaba, form gönderiminiz başarıyla tarafımıza ulaştı. En kısa sürede sizinle iletişime geçeceğiz.";
                    
                    // Replace merge tags
                    $applicantName = $request->input('name') ?? $request->input('prenom') ?? $request->input('nom') ?? '';
                    $replyMsg = str_replace('{{name}}', htmlspecialchars($applicantName), $replyMsg);
                    $replyMsg = str_replace('{{site}}', htmlspecialchars($site->name), $replyMsg);

                    Mail::mailer('tenant_smtp')->html("<div style='font-family:sans-serif;line-height:1.6;color:#222;'>" . nl2br($replyMsg) . "</div>", function ($msg) use ($applicantEmail, $replySubject, $fromAddress, $fromName) {
                        $msg->to($applicantEmail)
                            ->from($fromAddress, $fromName)
                            ->subject($replySubject);
                    });
                }
            } catch (\Throwable $e) {
                Log::warning("Tenant ({$site->slug}) SMTP email dispatch failed: " . $e->getMessage());
                $emailError = $e->getMessage();
            }
        }

        // Workflow Action 2: Outgoing Webhook Trigger (e.g. Zapier / Make / CRM)
        $webhookUrl = $form->settings['webhook_url'] ?? null;
        if (!empty($webhookUrl) && filter_var($webhookUrl, FILTER_VALIDATE_URL)) {
            try {
                \Illuminate\Support\Facades\Http::timeout(5)->post($webhookUrl, [
                    'event' => 'form_submission',
                    'site_id' => $site->id,
                    'site_slug' => $site->slug,
                    'form_id' => $form->id,
                    'form_slug' => $form->slug,
                    'submission_id' => $submission->id,
                    'data' => $submission->data,
                    'created_at' => $submission->created_at->toIso8601String(),
                ]);
            } catch (\Throwable $e) {
                Log::warning("Webhook dispatch failed for form {$form->slug}: " . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Mesajınız başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.',
            'submission_id' => $submission->id,
            'email_sent' => $emailSent,
            'email_error' => $emailError,
        ]);
    }

    /**
     * Generate dynamic sitemap.xml for current tenant
     */
    public function sitemap(Request $request): Response
    {
        $host = $request->query('domain') ?: $request->getHost();
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

        $scheme = $request->isSecure() ? 'https' : 'http';
        $domain = $site->domain ?: $host;
        $baseUrl = "{$scheme}://{$domain}";

        $pages = Page::where('site_id', $site->id)->get();
        $posts = Post::where('site_id', $site->id)
            ->where('status', 'published')
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Homepage
        $xml .= "  <url>\n";
        $xml .= "    <loc>" . htmlspecialchars($baseUrl . '/', ENT_XML1) . "</loc>\n";
        $xml .= "    <lastmod>" . ($site->updated_at ? $site->updated_at->toAtomString() : now()->toAtomString()) . "</lastmod>\n";
        $xml .= "    <changefreq>daily</changefreq>\n";
        $xml .= "    <priority>1.0</priority>\n";
        $xml .= "  </url>\n";

        // Pages
        foreach ($pages as $p) {
            if ($p->is_home) continue;
            $xml .= "  <url>\n";
            $xml .= "    <loc>" . htmlspecialchars($baseUrl . '/' . ltrim($p->slug, '/'), ENT_XML1) . "</loc>\n";
            $xml .= "    <lastmod>" . ($p->updated_at ? $p->updated_at->toAtomString() : now()->toAtomString()) . "</lastmod>\n";
            $xml .= "    <changefreq>weekly</changefreq>\n";
            $xml .= "    <priority>0.8</priority>\n";
            $xml .= "  </url>\n";
        }

        // Posts
        foreach ($posts as $post) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>" . htmlspecialchars($baseUrl . '/blog/' . ltrim($post->slug, '/'), ENT_XML1) . "</loc>\n";
            $xml .= "    <lastmod>" . ($post->updated_at ? $post->updated_at->toAtomString() : now()->toAtomString()) . "</lastmod>\n";
            $xml .= "    <changefreq>monthly</changefreq>\n";
            $xml .= "    <priority>0.6</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
        ]);
    }

    /**
     * Generate dynamic robots.txt for current tenant
     */
    public function robots(Request $request): Response
    {
        $host = $request->query('domain') ?: $request->getHost();
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

        $scheme = $request->isSecure() ? 'https' : 'http';
        $domain = $site->domain ?: $host;

        $content = "User-agent: *\n";
        $content .= "Allow: /\n";
        $content .= "Disallow: /api/\n";
        $content .= "Disallow: /admin\n";
        $content .= "Disallow: /admin/*\n\n";
        $content .= "Sitemap: {$scheme}://{$domain}/sitemap.xml\n";

        return response($content, 200, [
            'Content-Type' => 'text/plain; charset=utf-8',
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
     * List published blog posts / articles of a site
     */
    public function posts(string $siteSlug): JsonResponse
    {
        $site = Site::where('slug', $siteSlug)->firstOrFail();
        $posts = Post::where('site_id', $site->id)
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->get(['id', 'title', 'slug', 'excerpt', 'content', 'featured_image', 'published_at', 'created_at']);

        return response()->json(['posts' => $posts]);
    }

    /**
     * Get single published post by slug
     */
    public function post(string $siteSlug, string $postSlug): JsonResponse
    {
        $site = Site::where('slug', $siteSlug)->firstOrFail();
        $post = Post::where('site_id', $site->id)
            ->where('slug', $postSlug)
            ->firstOrFail();

        return response()->json(['post' => $post]);
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

    public function trackSubmission(Request $request, string $slug, string $token): JsonResponse
    {
        $site = Site::where('slug', $slug)->firstOrFail();
        $submission = FormSubmission::where('site_id', $site->id)
            ->where('tracking_token', $token)
            ->with('form:id,name,slug')
            ->first();

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Kayıt bulunamadı.'], 404);
        }

        if (!$submission->is_public) {
            return response()->json(['success' => false, 'message' => 'Bu kayıt için genel takip kapalıdır.'], 403);
        }

        $statusLabels = [
            'new' => 'Yeni Alındı',
            'in_review' => 'İnceleniyor',
            'approved' => 'Onaylandı',
            'rejected' => 'Reddedildi',
            'completed' => 'Tamamlandı',
        ];

        return response()->json([
            'success' => true,
            'submission' => [
                'tracking_token' => $submission->tracking_token,
                'form_name' => $submission->form->name ?? 'Başvuru',
                'status' => $submission->status,
                'status_label' => $statusLabels[$submission->status] ?? $submission->status,
                'created_at' => $submission->created_at,
                'history' => $submission->history ?? [],
                'data' => $submission->data,
            ],
            'site' => [
                'name' => $site->name,
                'slug' => $site->slug,
                'domain' => $site->domain,
            ]
        ]);
    }
}
