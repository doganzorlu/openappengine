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
            $parsed = $this->parseElement($element, true);
            if ($parsed) {
                $components[] = $parsed;
            }
        }

        return $components;
    }

    protected function parseElement(array $element, bool $isRoot = false): ?array
    {
        $elType = $element['elType'] ?? 'widget';
        $id = $element['id'] ?? uniqid('el_');
        $settings = $element['settings'] ?? [];
        $rawChildren = $element['elements'] ?? [];

        $children = [];
        if (!empty($rawChildren)) {
            foreach ($rawChildren as $child) {
                $parsedChild = $this->parseElement($child, false);
                if ($parsedChild) {
                    $children[] = $parsedChild;
                }
            }
        }

        $styles = $this->extractStyles($settings);

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
                'styles' => $styles,
                'children' => $children,
            ];
        }

        // Elementor Flexbox Container (Elementor 3.16+)
        if ($elType === 'container') {
            $bgImage = $settings['background_image']['url'] ?? $settings['background_overlay_image']['url'] ?? null;
            $overlayColor = $settings['background_overlay_color'] ?? null;
            $overlayOpacity = $settings['background_overlay_opacity']['size'] ?? 0.5;

            $minHeight = null;
            if (!empty($settings['min_height']['size'])) {
                $minHeight = $settings['min_height']['size'] . ($settings['min_height']['unit'] ?? 'px');
            }

            if ($isRoot) {
                return [
                    'id' => $id,
                    'type' => 'Section',
                    'props' => [
                        'minHeight' => $minHeight,
                        'bgImage' => $bgImage,
                        'bgColor' => $settings['background_color'] ?? null,
                        'bgAttachment' => $settings['background_attachment'] ?? $settings['background_overlay_attachment'] ?? 'scroll',
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
                        'layout' => $settings['content_width'] ?? 'boxed',
                        'flexDirection' => $settings['flex_direction'] ?? 'column',
                        'justifyContent' => $settings['flex_justify_content'] ?? 'center',
                        'alignItems' => $settings['flex_align_items'] ?? 'stretch',
                    ],
                    'styles' => $styles,
                    'children' => $children,
                ];
            }

            $width = $settings['width']['size'] ?? $settings['boxed_width']['size'] ?? 100;
            return [
                'id' => $id,
                'type' => 'Column',
                'props' => [
                    'width' => $width,
                    'flexDirection' => $settings['flex_direction'] ?? 'column',
                    'justifyContent' => $settings['flex_justify_content'] ?? 'start',
                    'alignItems' => $settings['flex_align_items'] ?? 'stretch',
                    'bgColor' => $settings['background_color'] ?? null,
                ],
                'styles' => $styles,
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
                'styles' => $styles,
                'children' => $children,
            ];
        }

        if ($elType === 'widget') {
            return $this->parseWidget($id, $element['widgetType'] ?? 'unknown', $settings, $styles);
        }

        return null;
    }

    protected function parseWidget(string $id, string $widgetType, array $settings, array $styles): array
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
                    'styles' => $styles,
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
                            'styles' => $styles,
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
                    'styles' => $styles,
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
                    'styles' => $styles,
                ];

            case 'video':
                return [
                    'id' => $id,
                    'type' => 'Video',
                    'props' => [
                        'url' => $settings['youtube_url'] ?? $settings['vimeo_url'] ?? '',
                        'type' => !empty($settings['youtube_url']) ? 'youtube' : 'vimeo',
                    ],
                    'styles' => $styles,
                ];

            case 'menu-anchor':
                return [
                    'id' => $id,
                    'type' => 'MenuAnchor',
                    'props' => [
                        'anchor' => $settings['anchor'] ?? '',
                    ],
                    'styles' => $styles,
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
                    'styles' => $styles,
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
                    'styles' => $styles,
                ];

            case 'shortcode':
                $shortcode = $settings['shortcode'] ?? '';
                if (preg_match('/\[embedyt\]\s*(https?:\/\/[^\s<\]]+)\s*\[\/embedyt\]/i', $shortcode, $matches)) {
                    $embedUrl = html_entity_decode($matches[1]);
                    return [
                        'id' => $id,
                        'type' => 'Video',
                        'props' => [
                            'url' => $embedUrl,
                            'type' => 'youtube',
                            'isPlaylist' => str_contains($embedUrl, 'list='),
                        ],
                        'styles' => $styles,
                    ];
                }
                return [
                    'id' => $id,
                    'type' => 'RichText',
                    'props' => [
                        'html' => '<div class="shortcode-container">' . htmlspecialchars($shortcode) . '</div>',
                    ],
                    'styles' => $styles,
                ];

            case 'button':
                return [
                    'id' => $id,
                    'type' => 'Button',
                    'props' => [
                        'text' => $settings['text'] ?? 'Tıklayınız',
                        'url' => $settings['link']['url'] ?? '#',
                        'target' => !empty($settings['link']['is_external']) ? '_blank' : '_self',
                        'align' => $settings['align'] ?? 'left',
                        'icon' => $settings['selected_icon']['value'] ?? null,
                    ],
                    'styles' => $styles,
                ];

            case 'counter':
                return [
                    'id' => $id,
                    'type' => 'Counter',
                    'props' => [
                        'endingNumber' => (int) ($settings['ending_number'] ?? 100),
                        'startingNumber' => (int) ($settings['starting_number'] ?? 0),
                        'prefix' => $settings['prefix'] ?? '',
                        'suffix' => $settings['suffix'] ?? '',
                        'title' => $settings['title'] ?? '',
                    ],
                    'styles' => $styles,
                ];

            case 'image-carousel':
                $carouselImages = [];
                foreach ($settings['carousel'] ?? [] as $img) {
                    if (!empty($img['url'])) {
                        $carouselImages[] = [
                            'id' => $img['id'] ?? uniqid(),
                            'url' => $img['url'],
                        ];
                    }
                }
                return [
                    'id' => $id,
                    'type' => 'ImageCarousel',
                    'props' => [
                        'images' => $carouselImages,
                        'slidesToShow' => (int) ($settings['slides_to_show'] ?? 4),
                        'autoplay' => ($settings['autoplay'] ?? 'yes') === 'yes',
                    ],
                    'styles' => $styles,
                ];

            case 'icon-box':
                return [
                    'id' => $id,
                    'type' => 'IconBox',
                    'props' => [
                        'title' => $settings['title_text'] ?? '',
                        'description' => $settings['description_text'] ?? '',
                        'icon' => $settings['selected_icon']['value'] ?? 'fas fa-star',
                        'url' => $settings['link']['url'] ?? null,
                    ],
                    'styles' => $styles,
                ];

            case 'image-box':
                return [
                    'id' => $id,
                    'type' => 'ImageBox',
                    'props' => [
                        'title' => $settings['title_text'] ?? '',
                        'description' => $settings['description_text'] ?? '',
                        'imageUrl' => $settings['image']['url'] ?? '',
                        'url' => $settings['link']['url'] ?? null,
                    ],
                    'styles' => $styles,
                ];

            case 'accordion':
            case 'nested-accordion':
            case 'eael-adv-accordion':
                $items = [];
                foreach ($settings['tabs'] ?? [] as $tab) {
                    $items[] = [
                        'id' => $tab['_id'] ?? uniqid(),
                        'title' => $tab['tab_title'] ?? '',
                        'content' => $tab['tab_content'] ?? '',
                    ];
                }
                return [
                    'id' => $id,
                    'type' => 'Accordion',
                    'props' => [
                        'items' => $items,
                    ],
                    'styles' => $styles,
                ];

            case 'spacer':
                $height = $settings['space']['size'] ?? 30;
                return [
                    'id' => $id,
                    'type' => 'Spacer',
                    'props' => [
                        'height' => $height . ($settings['space']['unit'] ?? 'px'),
                    ],
                    'styles' => $styles,
                ];

            case 'social-icons':
                $socials = [];
                foreach ($settings['social_icon_list'] ?? [] as $s) {
                    $socials[] = [
                        'id' => $s['_id'] ?? uniqid(),
                        'icon' => $s['social_icon']['value'] ?? '',
                        'url' => $s['link']['url'] ?? '#',
                    ];
                }
                return [
                    'id' => $id,
                    'type' => 'SocialIcons',
                    'props' => [
                        'items' => $socials,
                        'align' => $settings['align'] ?? 'center',
                    ],
                    'styles' => $styles,
                ];

            case 'call-to-action':
                return [
                    'id' => $id,
                    'type' => 'CallToAction',
                    'props' => [
                        'title' => $settings['title'] ?? '',
                        'description' => $settings['description'] ?? '',
                        'buttonText' => $settings['button_text'] ?? 'Detaylı Bilgi',
                        'buttonUrl' => $settings['link']['url'] ?? '#',
                        'bgImage' => $settings['bg_image']['url'] ?? null,
                    ],
                    'styles' => $styles,
                ];

            case 'form':
            case 'eael-wpforms':
            case 'wpforms':
                return [
                    'id' => $id,
                    'type' => 'ContactForm',
                    'props' => [
                        'formId' => $settings['form_id'] ?? $settings['form_name'] ?? 'contact-form',
                        'title' => $settings['form_name'] ?? 'İletişim Formu',
                    ],
                    'styles' => $styles,
                ];

            default:
                return [
                    'id' => $id,
                    'type' => 'GenericWidget',
                    'props' => [
                        'widgetType' => $widgetType,
                        'settings' => $settings,
                    ],
                    'styles' => $styles,
                ];
        }
    }

    /**
     * Extract structured CSS style properties for the visual editor and renderer
     */
    protected function extractStyles(array $settings): array
    {
        $styles = [];

        // 1. Background
        if (!empty($settings['background_color'])) {
            $styles['backgroundColor'] = $settings['background_color'];
        }

        // 2. Sizing & Dimensions (Independent width & height for boxes)
        if (!empty($settings['_custom_width']['size'])) {
            $styles['width'] = $settings['_custom_width']['size'] . ($settings['_custom_width']['unit'] ?? 'px');
        } elseif (!empty($settings['width']['size'])) {
            $styles['width'] = $settings['width']['size'] . ($settings['width']['unit'] ?? 'px');
        } elseif (!empty($settings['box_width'])) {
            $styles['width'] = $settings['box_width'];
        }

        if (!empty($settings['max_width']['size'])) {
            $styles['maxWidth'] = $settings['max_width']['size'] . ($settings['max_width']['unit'] ?? 'px');
        } elseif (!empty($settings['box_max_width'])) {
            $styles['maxWidth'] = $settings['box_max_width'];
        }

        if (!empty($settings['min_height']['size'])) {
            $styles['minHeight'] = $settings['min_height']['size'] . ($settings['min_height']['unit'] ?? 'px');
        } elseif (!empty($settings['box_min_height'])) {
            $styles['minHeight'] = $settings['box_min_height'];
        }

        if (!empty($settings['height']['size'])) {
            $styles['height'] = $settings['height']['size'] . ($settings['height']['unit'] ?? 'px');
        } elseif (!empty($settings['box_height'])) {
            $styles['height'] = $settings['box_height'];
        }

        // 3. Borders
        if (!empty($settings['border_border'])) {
            $styles['borderStyle'] = $settings['border_border'];
            $styles['borderColor'] = $settings['border_color'] ?? '#e2e8f0';
            if (!empty($settings['border_width'])) {
                $bw = $settings['border_width'];
                $u = $bw['unit'] ?? 'px';
                $styles['borderWidth'] = "{$bw['top']}{$u} {$bw['right']}{$u} {$bw['bottom']}{$u} {$bw['left']}{$u}";
            }
        }
        if (!empty($settings['border_radius'])) {
            $br = $settings['border_radius'];
            $u = $br['unit'] ?? 'px';
            $styles['borderRadius'] = "{$br['top']}{$u} {$br['right']}{$u} {$br['bottom']}{$u} {$br['left']}{$u}";
        }

        // 3. Box Shadow
        if (!empty($settings['box_shadow_box_shadow_type']) || !empty($settings['_box_shadow_box_shadow_type']) || !empty($settings['image_box_shadow_box_shadow_type']) || !empty($settings['eael_accordion_shadow_box_shadow_type'])) {
            $bs = $settings['box_shadow_box_shadow'] ?? $settings['_box_shadow_box_shadow'] ?? $settings['image_box_shadow_box_shadow'] ?? $settings['eael_accordion_shadow_box_shadow'] ?? null;
            if ($bs) {
                $h = $bs['horizontal'] ?? 0;
                $v = $bs['vertical'] ?? 0;
                $blur = $bs['blur'] ?? 10;
                $spread = $bs['spread'] ?? 0;
                $color = $bs['color'] ?? 'rgba(0,0,0,0.5)';
                $styles['boxShadow'] = "{$h}px {$v}px {$blur}px {$spread}px {$color}";
            } else {
                $styles['boxShadow'] = "0px 0px 15px rgba(0, 0, 0, 0.45)";
            }
        }

        // 4. Margins & Padding
        if (!empty($settings['_margin'])) {
            $m = $settings['_margin'];
            $u = $m['unit'] ?? 'px';
            $styles['margin'] = "{$m['top']}{$u} {$m['right']}{$u} {$m['bottom']}{$u} {$m['left']}{$u}";
        }
        if (!empty($settings['_padding'])) {
            $p = $settings['_padding'];
            $u = $p['unit'] ?? 'px';
            $styles['padding'] = "{$p['top']}{$u} {$p['right']}{$u} {$p['bottom']}{$u} {$p['left']}{$u}";
        }

        // 5. Typography
        if (!empty($settings['typography_font_size']['size'])) {
            $styles['fontSize'] = $settings['typography_font_size']['size'] . ($settings['typography_font_size']['unit'] ?? 'px');
        }
        if (!empty($settings['typography_font_weight'])) {
            $styles['fontWeight'] = (int) $settings['typography_font_weight'];
        }
        if (!empty($settings['typography_font_family'])) {
            $styles['fontFamily'] = $settings['typography_font_family'];
        }
        if (!empty($settings['text_color']) || !empty($settings['title_color'])) {
            $styles['color'] = $settings['text_color'] ?? $settings['title_color'];
        }
        if (!empty($settings['align'])) {
            $styles['textAlign'] = $settings['align'];
        }

        // 6. Animation
        if (!empty($settings['animation'])) {
            $styles['animation'] = $settings['animation'];
        }

        return $styles;
    }
}
