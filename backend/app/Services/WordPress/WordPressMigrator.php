<?php

namespace App\Services\WordPress;

use App\Models\Form;
use App\Models\Media;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Post;
use App\Models\Site;
use App\Services\Storage\TenantStorageService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use PDO;

class WordPressMigrator
{
    protected ElementorParser $parser;
    protected TenantStorageService $storageService;

    public function __construct(ElementorParser $parser, TenantStorageService $storageService)
    {
        $this->parser = $parser;
        $this->storageService = $storageService;
    }

    public function migrate(string $siteSlug, string $wpDbName, string $prefix = 'wp_', ?string $uploadsDir = null): array
    {
        $pdo = new PDO(
            "mysql:host=" . env('DB_HOST', 'db') . ";dbname={$wpDbName};charset=utf8mb4",
            env('DB_USERNAME', 'openappengine'),
            env('DB_PASSWORD', 'openappenginesecure'),
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );

        // Auto-detect table prefix if default wp_ doesn't match
        if ($prefix === 'wp_') {
            $foundTable = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema = '{$wpDbName}' AND table_name LIKE '%options' LIMIT 1")->fetchColumn();
            if ($foundTable && str_ends_with($foundTable, 'options')) {
                $prefix = substr($foundTable, 0, -7);
            }
        }

        $stats = [
            'site' => null,
            'pages' => 0,
            'posts' => 0,
            'menus' => 0,
            'forms' => 0,
            'media' => 0,
        ];

        // 1. EXTRACT ELEMENTOR GLOBAL COLORS & TYPOGRAPHY (Active Kit)
        $globalColors = [];
        $extractedFonts = [];
        $headingFont = null;
        $bodyFont = null;

        $kitId = $pdo->query("SELECT option_value FROM {$prefix}options WHERE option_name = 'elementor_active_kit'")->fetchColumn();
        if ($kitId) {
            $kitMeta = $pdo->query("SELECT meta_value FROM {$prefix}postmeta WHERE post_id = {$kitId} AND meta_key = '_elementor_page_settings'")->fetchColumn();
            if ($kitMeta) {
                $kitData = @unserialize($kitMeta) ?: json_decode($kitMeta, true);
                if (is_array($kitData)) {
                    foreach ($kitData['system_colors'] ?? [] as $sc) {
                        if (!empty($sc['_id']) && !empty($sc['color'])) {
                            $globalColors[$sc['_id']] = $sc['color'];
                        }
                    }
                    foreach ($kitData['custom_colors'] ?? [] as $cc) {
                        if (!empty($cc['_id']) && !empty($cc['color'])) {
                            $globalColors[$cc['_id']] = $cc['color'];
                        }
                    }

                    // Extract typography (system & custom)
                    $typoList = array_merge($kitData['system_typography'] ?? [], $kitData['custom_typography'] ?? []);
                    foreach ($typoList as $st) {
                        $fFam = $st['typography_font_family'] ?? null;
                        if (!empty($fFam) && is_string($fFam)) {
                            $cleanFont = trim(trim($fFam, "'\""));
                            $extractedFonts[] = $cleanFont;
                            $id = $st['_id'] ?? '';
                            if ($id === 'primary' && empty($headingFont)) {
                                $headingFont = $cleanFont;
                            } elseif (($id === 'text' || $id === 'secondary') && empty($bodyFont)) {
                                $bodyFont = $cleanFont;
                            }
                        }
                    }
                }
            }
        }
        $extractedFonts = array_values(array_unique($extractedFonts));
        $this->parser->setGlobalColors($globalColors);

        // 2. EXTRACT SITE LOGO (Prefer high-quality transparent PNG logo over lossy JPG)
        $logoUrl = null;
        try {
            $pngLogo = $pdo->query("
                SELECT guid FROM {$prefix}posts 
                WHERE post_type = 'attachment' 
                  AND (post_title LIKE '%logo%' OR guid LIKE '%logo%') 
                  AND (guid LIKE '%.png' OR post_mime_type = 'image/png') 
                ORDER BY ID DESC LIMIT 1
            ")->fetchColumn();
            if ($pngLogo) {
                $logoUrl = $pngLogo;
            }
        } catch (\Throwable $e) {}

        if (!$logoUrl) {
            $logoId = $pdo->query("SELECT option_value FROM {$prefix}options WHERE option_name = 'site_logo'")->fetchColumn();
            if (!$logoId) {
                $mods = $pdo->query("SELECT option_value FROM {$prefix}options WHERE option_name LIKE 'theme_mods_%'")->fetchColumn();
                if ($mods) {
                    $u = @unserialize($mods);
                    if (isset($u['custom_logo'])) {
                        $logoId = $u['custom_logo'];
                    }
                }
            }
            if ($logoId) {
                $logoUrl = $pdo->query("SELECT guid FROM {$prefix}posts WHERE ID = {$logoId}")->fetchColumn() ?: null;
            }
        }

        // 3. EXTRACT ELEMENTOR HEADER & FOOTER TEMPLATES
        $headerLayout = null;
        $footerLayout = null;

        $tmplStmt = $pdo->query("
            SELECT p.ID, pm.meta_value as template_type
            FROM {$prefix}posts p
            JOIN {$prefix}postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_elementor_template_type'
            WHERE p.post_type IN ('elementor_library', 'elementor-hf') AND p.post_status = 'publish'
        ");
        while ($tmpl = $tmplStmt->fetch(PDO::FETCH_ASSOC)) {
            $tId = $tmpl['ID'];
            $tType = $tmpl['template_type'];
            $tJson = $pdo->query("SELECT meta_value FROM {$prefix}postmeta WHERE post_id = {$tId} AND meta_key = '_elementor_data'")->fetchColumn();
            if ($tJson) {
                $tArr = json_decode($tJson, true);
                if (is_array($tArr)) {
                    if ($tType === 'header' && empty($headerLayout)) {
                        $headerLayout = $this->parser->parse($tArr, $globalColors);
                    } elseif ($tType === 'footer' && empty($footerLayout)) {
                        $footerLayout = $this->parser->parse($tArr, $globalColors);
                    }
                }
            }
        }

        // 4. SITE & OPTIONS
        $optionsStmt = $pdo->query("SELECT option_name, option_value FROM {$prefix}options WHERE option_name IN ('blogname', 'blogdescription', 'siteurl', 'home', 'page_on_front')");
        $options = $optionsStmt->fetchAll(PDO::FETCH_KEY_PAIR);

        $siteName = $options['blogname'] ?? ucfirst($siteSlug);
        $domain = parse_url($options['home'] ?? "https://{$siteSlug}.com", PHP_URL_HOST) ?? "{$siteSlug}.com";
        $pageOnFront = (int) ($options['page_on_front'] ?? 0);

        // Normalize logo URL to OpenAppEngine tenant storage
        if ($logoUrl) {
            $logoUrl = $this->storageService->rewriteLegacyUrls($logoUrl, $siteSlug, [$options['home'] ?? '', $domain]);
        }

        $primaryColor = $globalColors['primary'] ?? '#BB0096';
        $siteSettings = [
            'original_home' => $options['home'] ?? '',
            'original_siteurl' => $options['siteurl'] ?? '',
            'logo_url' => $logoUrl,
            'global_colors' => $globalColors,
        ];
        if ($headerLayout) {
            $siteSettings['header_layout'] = $headerLayout;
        }
        if ($footerLayout) {
            $siteSettings['footer_layout'] = $footerLayout;
        }

        $site = Site::updateOrCreate(
            ['slug' => $siteSlug],
            [
                'name' => $siteName,
                'domain' => $domain,
                'description' => $options['blogdescription'] ?? '',
                'settings' => $siteSettings,
                'theme_config' => [
                    'primary_color' => $primaryColor,
                    'secondary_color' => $globalColors['secondary'] ?? '#f3f4f6',
                    'font_family' => $bodyFont ? "{$bodyFont}, sans-serif" : 'Syne, sans-serif',
                    'heading_font_family' => $headingFont ? "{$headingFont}, serif" : 'Playfair Display, serif',
                    'fonts' => !empty($extractedFonts) ? $extractedFonts : ['Playfair Display', 'Syne'],
                    'header_transparent' => true,
                    'sticky_header' => true,
                    'logo_url' => $logoUrl,
                ],
                'status' => 'active',
            ]
        );
        $stats['site'] = $site->name;

        // 5. IMPORT ATTACHMENTS & MEDIA TO TENANT STORAGE
        // Auto-discover uploads directory if not explicitly provided
        if (empty($uploadsDir)) {
            $possibleDirs = [
                "/Volumes/SSDBIGDATA/Projects/WebSites/doganzorlu/{$domain}/wp-content/uploads",
                "/Volumes/SSDBIGDATA/Projects/WebSites/doganzorlu/{$siteSlug}/wp-content/uploads",
                base_path("../doganzorlu/{$domain}/wp-content/uploads"),
                base_path("../doganzorlu/{$siteSlug}/wp-content/uploads"),
            ];
            foreach ($possibleDirs as $candidate) {
                if (File::isDirectory($candidate)) {
                    $uploadsDir = $candidate;
                    break;
                }
            }
        }

        if (!empty($uploadsDir) && File::isDirectory($uploadsDir)) {
            $importResult = $this->storageService->importWpUploads($site, $uploadsDir);
            $stats['media'] = $importResult['count'] ?? 0;
        } else {
            // Register attachments from WP database into Media table
            try {
                $attachStmt = $pdo->query("SELECT ID, post_title, guid, post_mime_type FROM {$prefix}posts WHERE post_type = 'attachment'");
                while ($att = $attachStmt->fetch(PDO::FETCH_ASSOC)) {
                    $normUrl = $this->storageService->rewriteLegacyUrls($att['guid'] ?? '', $siteSlug, [$options['home'] ?? '', $domain]);
                    $relPath = preg_replace('#^/storage/#', '', $normUrl);

                    Media::updateOrCreate(
                        [
                            'site_id' => $site->id,
                            'file_path' => $relPath,
                        ],
                        [
                            'name' => basename($normUrl),
                            'file_url' => $normUrl,
                            'mime_type' => $att['post_mime_type'] ?: 'image/jpeg',
                            'file_size' => 0,
                            'alt_text' => $att['post_title'] ?: basename($normUrl),
                            'meta' => [],
                        ]
                    );
                    $stats['media']++;
                }
            } catch (\Throwable $e) {}
        }

        // 6. FORMS (WPForms + Elementor Pro Forms)
        $formsStmt = $pdo->query("SELECT ID, post_title, post_name, post_content FROM {$prefix}posts WHERE post_type = 'wpforms' AND post_status = 'publish'");
        while ($row = $formsStmt->fetch(PDO::FETCH_ASSOC)) {
            $formData = json_decode($row['post_content'], true);
            if ($formData) {
                Form::updateOrCreate(
                    [
                        'site_id' => $site->id,
                        'slug' => $row['post_name'] ?: 'form-' . $row['ID'],
                    ],
                    [
                        'name' => $row['post_title'],
                        'fields' => $formData['fields'] ?? [],
                        'settings' => $formData['settings'] ?? [],
                    ]
                );
                $stats['forms']++;
            }
        }

        // Check for Elementor forms snapshots
        $elFormsStmt = $pdo->query("SELECT meta_value FROM {$prefix}postmeta WHERE meta_key = '__elementor_forms_snapshot'");
        while ($elRow = $elFormsStmt->fetch(PDO::FETCH_ASSOC)) {
            $elForms = json_decode($elRow['meta_value'], true);
            if (is_array($elForms)) {
                foreach ($elForms as $ef) {
                    $formSlug = \Illuminate\Support\Str::slug($ef['name'] ?? 'form-' . ($ef['id'] ?? uniqid()));
                    Form::updateOrCreate(
                        [
                            'site_id' => $site->id,
                            'slug' => $formSlug,
                        ],
                        [
                            'name' => $ef['name'] ?? 'Form ' . ($ef['id'] ?? ''),
                            'fields' => $ef['fields'] ?? [],
                            'settings' => [],
                        ]
                    );
                    $stats['forms']++;
                }
            }
        }

        // 7. PAGES
        $pagesStmt = $pdo->query("SELECT ID, post_title, post_name, post_content, post_status FROM {$prefix}posts WHERE post_type = 'page' AND post_status = 'publish'");
        while ($row = $pagesStmt->fetch(PDO::FETCH_ASSOC)) {
            $postId = $row['ID'];

            // Check Elementor data
            $metaStmt = $pdo->prepare("SELECT meta_value FROM {$prefix}postmeta WHERE post_id = ? AND meta_key = '_elementor_data'");
            $metaStmt->execute([$postId]);
            $elementorJsonRaw = $metaStmt->fetchColumn();

            $layout = [];
            if ($elementorJsonRaw) {
                $elementorArray = json_decode($elementorJsonRaw, true);
                if (is_array($elementorArray)) {
                    $layout = $this->parser->parse($elementorArray, $globalColors);
                }
            }

            if (empty($layout)) {
                $layout = [
                    [
                        'id' => 'content-1',
                        'type' => 'RichText',
                        'props' => ['html' => $row['post_content']],
                    ],
                ];
            }

            $isHome = ($postId === $pageOnFront || $row['post_name'] === 'homepage' || $row['post_name'] === 'home');

            Page::updateOrCreate(
                [
                    'site_id' => $site->id,
                    'slug' => $row['post_name'] ?: 'page-' . $postId,
                ],
                [
                    'title' => $row['post_title'],
                    'is_home' => $isHome,
                    'layout' => $layout,
                    'seo' => [
                        'title' => $row['post_title'] . ' | ' . $site->name,
                        'description' => $site->description,
                    ],
                    'status' => 'published',
                ]
            );
            $stats['pages']++;
        }

        // 8. POSTS / ARTICLES
        $postsStmt = $pdo->query("SELECT ID, post_title, post_name, post_excerpt, post_content, post_date FROM {$prefix}posts WHERE post_type = 'post' AND post_status = 'publish'");
        while ($row = $postsStmt->fetch(PDO::FETCH_ASSOC)) {
            Post::updateOrCreate(
                [
                    'site_id' => $site->id,
                    'slug' => $row['post_name'] ?: 'post-' . $row['ID'],
                ],
                [
                    'title' => $row['post_title'],
                    'excerpt' => $row['post_excerpt'],
                    'content' => $row['post_content'],
                    'published_at' => $row['post_date'],
                    'status' => 'published',
                ]
            );
            $stats['posts']++;
        }

        // 9. MENUS
        $menuStmt = $pdo->query("
            SELECT t.term_id, t.name, t.slug 
            FROM {$prefix}terms t 
            INNER JOIN {$prefix}term_taxonomy tt ON t.term_id = tt.term_id 
            WHERE tt.taxonomy = 'nav_menu'
        ");
        while ($menuRow = $menuStmt->fetch(PDO::FETCH_ASSOC)) {
            $menu = Menu::updateOrCreate(
                [
                    'site_id' => $site->id,
                    'name' => $menuRow['name'],
                ],
                [
                    'location' => 'header',
                ]
            );

            // Fetch menu items
            $itemsStmt = $pdo->prepare("
                SELECT p.ID, p.post_title, p.menu_order,
                       pm_url.meta_value as custom_url,
                       pm_obj.meta_value as object_id
                FROM {$prefix}posts p
                INNER JOIN {$prefix}term_relationships tr ON p.ID = tr.object_id
                LEFT JOIN {$prefix}postmeta pm_url ON p.ID = pm_url.post_id AND pm_url.meta_key = '_menu_item_url'
                LEFT JOIN {$prefix}postmeta pm_obj ON p.ID = pm_obj.post_id AND pm_obj.meta_key = '_menu_item_object_id'
                WHERE tr.term_taxonomy_id = ? AND p.post_type = 'nav_menu_item' AND p.post_status = 'publish'
                ORDER BY p.menu_order ASC
            ");
            $itemsStmt->execute([$menuRow['term_id']]);

            while ($itemRow = $itemsStmt->fetch(PDO::FETCH_ASSOC)) {
                $title = $itemRow['post_title'];
                $url = $itemRow['custom_url'] ?? '#';

                // If title is empty, find object title
                if (empty($title) && !empty($itemRow['object_id'])) {
                    $objStmt = $pdo->prepare("SELECT post_title FROM {$prefix}posts WHERE ID = ?");
                    $objStmt->execute([$itemRow['object_id']]);
                    $title = $objStmt->fetchColumn() ?: 'Menü Öğesi';
                }

                if (!empty($title)) {
                    MenuItem::updateOrCreate(
                        [
                            'menu_id' => $menu->id,
                            'title' => $title,
                        ],
                        [
                            'url' => $url,
                            'sort_order' => $itemRow['menu_order'] ?? 0,
                        ]
                    );
                }
            }
            $stats['menus']++;
        }

        // 10. REWRITE ALL TENANT URLS (Clean OpenAppEngine tenant storage paths)
        $this->storageService->rewriteAllTenantUrls($site, [$options['home'] ?? '', $domain]);

        return $stats;
    }
}
