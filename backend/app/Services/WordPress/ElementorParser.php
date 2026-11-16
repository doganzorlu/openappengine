<?php

namespace App\Services\WordPress;

class ElementorParser
{
    /**
     * Parse the raw Elementor JSON array into OpenAppEngine Component Tree
     */
    public function parse(array $elementorElements): array
    {
        $components = [];

        foreach ($elementorElements as $element) {
            $parsed = $this->parseElement($element);
            if ($parsed) {
                $components[] = $parsed;
            }
        }

        return $components;
    }

    protected function parseElement(array $element): ?array
    {
        $elType = $element['elType'] ?? 'widget';
        $id = $element['id'] ?? uniqid('el_');
        $settings = $element['settings'] ?? [];
        $rawChildren = $element['elements'] ?? [];

        $children = [];
        if (!empty($rawChildren)) {
            foreach ($rawChildren as $child) {
                $parsedChild = $this->parseElement($child);
                if ($parsedChild) {
                    $children[] = $parsedChild;
                }
            }
        }

        if ($elType === 'section') {
            $overlayColor = $settings['background_overlay_color'] ?? null;
            $overlayOpacity = $settings['background_overlay_opacity']['size'] ?? 0.5;

            return [
                'id' => $id,
                'type' => 'Section',
                'props' => [
                    'minHeight' => $settings['custom_height']['size'] ?? null,
                    'bgImage' => $settings['background_image']['url'] ?? null,
                    'bgColor' => $settings['background_color'] ?? null,
                    'bgAttachment' => $settings['background_attachment'] ?? 'scroll',
                    'bgOverlayColor' => $overlayColor,
                    'bgOverlayOpacity' => $overlayColor ? $overlayOpacity : null,
                    'shapeDividerTop' => !empty($settings['shape_divider_top']) ? [
                        'shape' => $settings['shape_divider_top'],
                        'color' => $settings['shape_divider_top_color'] ?? '#ffffff',
                        'height' => $settings['shape_divider_top_height']['size'] ?? 57,
                    ] : null,
                    'shapeDividerBottom' => !empty($settings['shape_divider_bottom']) ? [
                        'shape' => $settings['shape_divider_bottom'],
                        'color' => $settings['shape_divider_bottom_color'] ?? '#ffffff',
                        'height' => $settings['shape_divider_bottom_height']['size'] ?? 61,
                    ] : null,
                    'layout' => $settings['layout'] ?? 'boxed',
                    'contentPosition' => $settings['content_position'] ?? 'top',
                ],
                'children' => $children,
            ];
        }

        if ($elType === 'column') {
            return [
                'id' => $id,
                'type' => 'Column',
                'props' => [
                    'width' => $settings['_column_size'] ?? 100,
                    'inlineSize' => $settings['_inline_size'] ?? null,
                    'bgColor' => $settings['background_color'] ?? null,
                    'boxShadow' => !empty($settings['box_shadow_box_shadow_type']),
                    'animation' => $settings['animation'] ?? null,
                    'align' => $settings['align'] ?? 'left',
                ],
                'children' => $children,
            ];
        }

        if ($elType === 'widget') {
            return $this->parseWidget($id, $element['widgetType'] ?? 'unknown', $settings);
        }

        return null;
    }

    protected function parseWidget(string $id, string $widgetType, array $settings): array
    {
        switch ($widgetType) {
            case 'heading':
                return [
                    'id' => $id,
                    'type' => 'Heading',
                    'props' => [
                        'text' => $settings['title'] ?? '',
                        'level' => $settings['header_size'] ?? 'h2',
                        'align' => $settings['align'] ?? 'left',
                        'color' => $settings['title_color'] ?? null,
                    ],
                ];

            case 'text-editor':
                $html = $settings['editor'] ?? '';

                // Handle WordPress [embedyt] shortcodes from youtube-embed-plus
                if (preg_match('/\[embedyt\]\s*(https?:\/\/[^\s<\]]+)\s*\[\/embedyt\]/i', $html, $matches)) {
                    $embedUrl = html_entity_decode($matches[1]);
                    $cleanHtml = trim(strip_tags(preg_replace('/\[embedyt\].*?\[\/embedyt\]/is', '', $html)));

                    if (empty($cleanHtml)) {
                        return [
                            'id' => $id,
                            'type' => 'Video',
                            'props' => [
                                'url' => $embedUrl,
                                'type' => 'youtube',
                                'isPlaylist' => str_contains($embedUrl, 'list='),
                            ],
                        ];
                    }

                    $iframe = '<div class="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl my-6 bg-black"><iframe src="' . htmlspecialchars($embedUrl) . '" class="absolute inset-0 w-full h-full border-0" allowfullscreen></iframe></div>';
                    $html = preg_replace('/\[embedyt\].*?\[\/embedyt\]/is', $iframe, $html);
                }

                $fontSize = null;
                if (!empty($settings['typography_font_size']['size'])) {
                    $fontSize = $settings['typography_font_size']['size'] . ($settings['typography_font_size']['unit'] ?? 'px');
                }

                return [
                    'id' => $id,
                    'type' => 'RichText',
                    'props' => [
                        'html' => $html,
                        'align' => $settings['align'] ?? 'left',
                        'color' => $settings['text_color'] ?? null,
                        'fontSize' => $fontSize,
                        'fontWeight' => $settings['typography_font_weight'] ?? null,
                    ],
                ];

            case 'image':
                return [
                    'id' => $id,
                    'type' => 'Image',
                    'props' => [
                        'url' => $settings['image']['url'] ?? '',
                        'alt' => $settings['caption'] ?? '',
                        'align' => $settings['align'] ?? 'center',
                    ],
                ];

            case 'video':
                return [
                    'id' => $id,
                    'type' => 'Video',
                    'props' => [
                        'url' => $settings['youtube_url'] ?? $settings['vimeo_url'] ?? '',
                        'type' => !empty($settings['youtube_url']) ? 'youtube' : 'vimeo',
                    ],
                ];

            case 'menu-anchor':
                return [
                    'id' => $id,
                    'type' => 'MenuAnchor',
                    'props' => [
                        'anchor' => $settings['anchor'] ?? '',
                    ],
                ];

            case 'timeline-widget-addon':
                $items = [];
                foreach ($settings['twae_list'] ?? [] as $item) {
                    $items[] = [
                        'id' => $item['_id'] ?? uniqid(),
                        'year' => $item['twae_year'] ?? '',
                        'date' => $item['twae_date_label'] ?? '',
                        'title' => $item['twae_story_title'] ?? '',
                        'description' => $item['twae_description'] ?? '',
                        'icon' => $item['twae_story_icon']['value'] ?? 'fas fa-music',
                        'image' => $item['twae_image']['url'] ?? null,
                    ];
                }
                return [
                    'id' => $id,
                    'type' => 'Timeline',
                    'props' => [
                        'accentColor' => $settings['twae_date_label_color'] ?? '#BB0096',
                        'items' => $items,
                    ],
                ];

            case 'eael-image-accordion':
                $items = [];
                foreach ($settings['eael_img_accordions'] ?? [] as $item) {
                    $items[] = [
                        'id' => $item['_id'] ?? uniqid(),
                        'title' => $item['eael_accordion_tittle'] ?? '',
                        'content' => $item['eael_accordion_content'] ?? '',
                        'bgImage' => $item['eael_accordion_bg']['url'] ?? '',
                    ];
                }
                return [
                    'id' => $id,
                    'type' => 'ImageAccordion',
                    'props' => [
                        'height' => $settings['eael_accordion_height'] ?? 400,
                        'items' => $items,
                    ],
                ];

            case 'eael-wpforms':
            case 'wpforms':
                return [
                    'id' => $id,
                    'type' => 'ContactForm',
                    'props' => [
                        'formId' => $settings['form_id'] ?? null,
                        'title' => $settings['form_name'] ?? 'İletişim Formu',
                    ],
                ];

            default:
                return [
                    'id' => $id,
                    'type' => 'GenericWidget',
                    'props' => [
                        'widgetType' => $widgetType,
                        'settings' => $settings,
                    ],
                ];
        }
    }
}
