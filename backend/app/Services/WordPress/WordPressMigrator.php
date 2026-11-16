<?php

namespace App\Services\WordPress;

use App\Models\Form;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Post;
use App\Models\Site;
use Illuminate\Support\Facades\DB;
use PDO;

class WordPressMigrator
{
    protected ElementorParser $parser;

    public function __construct(ElementorParser $parser)
    {
        $this->parser = $parser;
    }

    public function migrate(string $siteSlug, string $wpDbName, string $prefix = 'wp_'): array
    {
        $pdo = new PDO(
            "mysql:host=" . env('DB_HOST', 'db') . ";dbname={$wpDbName};charset=utf8mb4",
            env('DB_USERNAME', 'openappengine'),
            env('DB_PASSWORD', 'openappenginesecure'),
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );

        $stats = [
            'site' => null,
            'pages' => 0,
            'posts' => 0,
            'menus' => 0,
            'forms' => 0,
        ];

        // 1. SITE & OPTIONS
        $optionsStmt = $pdo->query("SELECT option_name, option_value FROM {$prefix}options WHERE option_name IN ('blogname', 'blogdescription', 'siteurl', 'home', 'page_on_front')");
        $options = $optionsStmt->fetchAll(PDO::FETCH_KEY_PAIR);

        $siteName = $options['blogname'] ?? ucfirst($siteSlug);
        $domain = parse_url($options['home'] ?? "https://{$siteSlug}.com", PHP_URL_HOST) ?? "{$siteSlug}.com";
        $pageOnFront = (int) ($options['page_on_front'] ?? 0);

        $site = Site::updateOrCreate(
            ['slug' => $siteSlug],
            [
                'name' => $siteName,
                'domain' => $domain,
                'description' => $options['blogdescription'] ?? '',
                'settings' => [
                    'original_home' => $options['home'] ?? '',
                    'original_siteurl' => $options['siteurl'] ?? '',
                ],
                'theme_config' => [
                    'primary_color' => '#BB0096',
                    'font_family' => 'Roboto, sans-serif',
                ],
                'status' => 'active',
            ]
        );
        $stats['site'] = $site->name;

        // 2. FORMS (WPForms)
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

        // 3. PAGES
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
                    $layout = $this->parser->parse($elementorArray);
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

        // 4. POSTS / ARTICLES
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

        // 5. MENUS
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

        return $stats;
    }
}
