<?php

namespace App\Services\WordPress;

class ElementorParser
{
    protected array $globalColors = [];
    protected array $globalTypography = [];

    public function setGlobalColors(array $colors): void
    {
        $this->globalColors = $colors;
    }

    public function setGlobalTypography(array $typography): void
    {
        $this->globalTypography = $typography;
    }

    public function resolveTypography(?string $globalRef): ?array
    {
        if (!$globalRef) return null;
        if (preg_match('/id=([a-zA-Z0-9_-]+)/', $globalRef, $m)) {
            $id = $m[1];
            if (isset($this->globalTypography[$id])) {
                return $this->globalTypography[$id];
            }
        }
        if (isset($this->globalTypography[$globalRef])) {
            return $this->globalTypography[$globalRef];
        }
        return null;
    }

    public function resolveColor(?string $color, ?string $globalRef = null): ?string
    {
        if ($globalRef && preg_match('/id=([a-zA-Z0-9_-]+)/', $globalRef, $m)) {
            $id = $m[1];
            if (isset($this->globalColors[$id])) {
                return $this->globalColors[$id];
            }
        }
        if ($color && !empty($this->globalColors[$color])) {
            return $this->globalColors[$color];
        }
        if (!empty($color) && is_string($color) && !str_starts_with($color, 'globals/')) {
            return $color;
        }
        return null;
    }

    /**
     * Parse the raw Elementor JSON array into OpenAppEngine Component Tree
     */
    public function parse(array $elementorElements, array $globalColors = [], array $globalTypography = []): array
    {
        if (!empty($globalColors)) {
            $this->globalColors = $globalColors;
        }
        if (!empty($globalTypography)) {
            $this->globalTypography = $globalTypography;
        }

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
            $overlayColor = $this->resolveColor(
                $settings['background_overlay_color'] ?? null,
                $settings['__globals__']['background_overlay_color'] ?? null
            );
            $overlayOpacity = $settings['background_overlay_opacity']['size'] ?? 0.5;

            $bgColor = $this->resolveColor(
                $settings['background_color'] ?? null,
                $settings['__globals__']['background_color'] ?? null
            );

            $topColor = $this->resolveColor(
                $settings['shape_divider_top_color'] ?? null,
                $settings['__globals__']['shape_divider_top_color'] ?? null
            ) ?? '#ffffff';

            $bottomColor = $this->resolveColor(
                $settings['shape_divider_bottom_color'] ?? null,
                $settings['__globals__']['shape_divider_bottom_color'] ?? null
            ) ?? '#ffffff';

            $isBgVideo = ($settings['background_background'] ?? '') === 'video' || !empty($settings['background_video_link']);

            return [
                'id' => $id,
                'type' => 'Section',
                'props' => [
                    'minHeight' => $settings['custom_height']['size'] ?? null,
                    'bgImage' => $settings['background_image']['url'] ?? null,
                    'bgColor' => $bgColor,
                    'bgVideo' => $isBgVideo ? ($settings['background_video_link'] ?? null) : null,
                    'bgAttachment' => $settings['background_attachment'] ?? 'scroll',
                    'bgOverlayColor' => $overlayColor,
                    'bgOverlayOpacity' => $overlayColor ? $overlayOpacity : null,
                    'shapeDividerTop' => !empty($settings['shape_divider_top']) ? [
                        'shape' => $settings['shape_divider_top'],
                        'color' => $topColor,
                        'height' => $settings['shape_divider_top_height']['size'] ?? 57,
                    ] : null,
                    'shapeDividerBottom' => !empty($settings['shape_divider_bottom']) ? [
                        'shape' => $settings['shape_divider_bottom'],
                        'color' => $bottomColor,
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
            $overlayColor = $this->resolveColor(
                $settings['background_overlay_color'] ?? null,
                $settings['__globals__']['background_overlay_color'] ?? null
            );
            $overlayOpacity = $settings['background_overlay_opacity']['size'] ?? 0.5;

            $bgColor = $this->resolveColor(
                $settings['background_color'] ?? null,
                $settings['__globals__']['background_color'] ?? null
            );

            $topColor = $this->resolveColor(
                $settings['shape_divider_top_color'] ?? null,
                $settings['__globals__']['shape_divider_top_color'] ?? null
            ) ?? '#ffffff';

            $bottomColor = $this->resolveColor(
                $settings['shape_divider_bottom_color'] ?? null,
                $settings['__globals__']['shape_divider_bottom_color'] ?? null
            ) ?? '#ffffff';

            $isBgVideo = ($settings['background_background'] ?? '') === 'video' || !empty($settings['background_video_link']);

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
                        'bgColor' => $bgColor,
                        'bgVideo' => $isBgVideo ? ($settings['background_video_link'] ?? null) : null,
                        'bgAttachment' => $settings['background_attachment'] ?? $settings['background_overlay_attachment'] ?? 'scroll',
                        'bgOverlayColor' => $overlayColor,
                        'bgOverlayOpacity' => $overlayColor ? $overlayOpacity : null,
                        'shapeDividerTop' => !empty($settings['shape_divider_top']) ? [
                            'shape' => $settings['shape_divider_top'],
                            'color' => $topColor,
                            'height' => $settings['shape_divider_top_height']['size'] ?? 57,
                        ] : null,
                        'shapeDividerBottom' => !empty($settings['shape_divider_bottom']) ? [
                            'shape' => $settings['shape_divider_bottom'],
                            'color' => $bottomColor,
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
                    'bgColor' => $bgColor,
                ],
                'styles' => $styles,
                'children' => $children,
            ];
        }

        if ($elType === 'column') {
            $colBg = $this->resolveColor(
                $settings['background_color'] ?? null,
                $settings['__globals__']['background_color'] ?? null
            );
            return [
                'id' => $id,
                'type' => 'Column',
                'props' => [
                    'width' => $settings['_column_size'] ?? 100,
                    'inlineSize' => $settings['_inline_size'] ?? null,
                    'bgColor' => $colBg,
                    'boxShadow' => !empty($settings['box_shadow_box_shadow_type']),
                    'animation' => $settings['animation'] ?? null,
                    'align' => $settings['align'] ?? 'left',
                ],
                'styles' => $styles,
                'children' => $children,
            ];
        }

        if ($elType === 'widget') {
            return $this->parseWidget($id, $element['widgetType'] ?? 'unknown', $settings, $styles, $children);
        }

        return null;
    }

    protected function parseWidget(string $id, string $widgetType, array $settings, array $styles, array $children = []): array
    {
        switch ($widgetType) {
            case 'heading':
                $headingColor = $this->resolveColor(
                    $settings['title_color'] ?? null,
                    $settings['__globals__']['title_color'] ?? null
                );
                return [
                    'id' => $id,
                    'type' => 'Heading',
                    'props' => [
                        'text' => $settings['title'] ?? '',
                        'level' => $settings['header_size'] ?? 'h2',
                        'align' => $settings['align'] ?? 'left',
                        'color' => $headingColor,
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

                $textColor = $this->resolveColor(
                    $settings['text_color'] ?? null,
                    $settings['__globals__']['text_color'] ?? null
                );

                return [
                    'id' => $id,
                    'type' => 'RichText',
                    'props' => [
                        'html' => $html,
                        'align' => $settings['align'] ?? 'left',
                        'color' => $textColor,
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
                if (preg_match('/\[contact-form-7.*?title=["\'](.*?)["\']/i', $shortcode, $matches)) {
                    return [
                        'id' => $id,
                        'type' => 'ContactForm',
                        'props' => [
                            'formId' => 'cf7-' . $id,
                            'title' => $matches[1] ?: 'İletişim Formu',
                        ],
                        'styles' => $styles,
                    ];
                }
                if (str_contains($shortcode, 'wpda_org_chart')) {
                    return [
                        'id' => $id,
                        'type' => 'OrgChart',
                        'props' => [
                            'title' => 'Organizasyon Şeması',
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
                $btnBg = $this->resolveColor(
                    $settings['button_background_color'] ?? $settings['background_color'] ?? null,
                    $settings['__globals__']['button_background_color'] ?? $settings['__globals__']['background_color'] ?? null
                );
                $btnColor = $this->resolveColor(
                    $settings['button_text_color'] ?? $settings['text_color'] ?? null,
                    $settings['__globals__']['button_text_color'] ?? $settings['__globals__']['text_color'] ?? null
                );
                
                // Extract Button Variant & Shape
                $hasBorder = !empty($settings['border_border']) && $settings['border_border'] !== 'none';
                $borderWidthSetting = $settings['border_width'] ?? [];
                $isUnderline = false;
                if (is_array($borderWidthSetting)) {
                    $top = (int)($borderWidthSetting['top'] ?? 0);
                    $bottom = (int)($borderWidthSetting['bottom'] ?? 0);
                    $left = (int)($borderWidthSetting['left'] ?? 0);
                    $right = (int)($borderWidthSetting['right'] ?? 0);
                    if ($bottom > 0 && $top === 0 && $left === 0 && $right === 0) {
                        $isUnderline = true;
                    }
                }
                $variant = $isUnderline ? 'underline' : ($hasBorder ? 'outline' : 'solid');

                // Shape from border_radius
                $radiusVal = null;
                if (isset($settings['border_radius']['top'])) {
                    $radiusVal = (int) $settings['border_radius']['top'];
                }
                $shape = ($radiusVal !== null && $radiusVal >= 20) ? 'pill' : (($radiusVal === 0) ? 'square' : 'pill');

                // Hover animation
                $hoverAnim = $settings['hover_animation'] ?? 'shrink';
                if ($hoverAnim === 'elementor-animation-shrink') $hoverAnim = 'shrink';
                if ($hoverAnim === 'elementor-animation-grow') $hoverAnim = 'grow';

                $size = $settings['size'] ?? 'md';
                $isUppercase = ($settings['typography_text_transform'] ?? '') === 'uppercase';

                $borderColor = $this->resolveColor(
                    $settings['border_color'] ?? null,
                    $settings['__globals__']['border_color'] ?? null
                );

                return [
                    'id' => $id,
                    'type' => 'Button',
                    'props' => [
                        'text' => $settings['text'] ?? 'Tıklayınız',
                        'url' => $settings['link']['url'] ?? '#',
                        'target' => !empty($settings['link']['is_external']) ? '_blank' : '_self',
                        'align' => $settings['align'] ?? 'left',
                        'icon' => $settings['selected_icon']['value'] ?? null,
                        'bgColor' => $btnBg,
                        'color' => $btnColor,
                        'variant' => $variant,
                        'shape' => $shape,
                        'size' => $size,
                        'hoverEffect' => $hoverAnim,
                        'uppercase' => $isUppercase,
                        'borderColor' => $borderColor,
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

            case 'nested-carousel':
            case 'loop-carousel':
                return [
                    'id' => $id,
                    'type' => 'SlideCarousel',
                    'props' => [
                        'slidesToShow' => (int) ($settings['slides_to_show'] ?? 3),
                        'autoplay' => ($settings['autoplay'] ?? 'yes') === 'yes',
                    ],
                    'styles' => $styles,
                    'children' => $children,
                ];

            case 'icon-box':
                $iconColor = $this->resolveColor(
                    $settings['primary_color'] ?? null,
                    $settings['__globals__']['primary_color'] ?? null
                );
                $titleColor = $this->resolveColor(
                    $settings['title_color'] ?? null,
                    $settings['__globals__']['title_color'] ?? null
                );
                $descColor = $this->resolveColor(
                    $settings['description_color'] ?? null,
                    $settings['__globals__']['description_color'] ?? null
                );
                return [
                    'id' => $id,
                    'type' => 'IconBox',
                    'props' => [
                        'title' => $settings['title_text'] ?? '',
                        'description' => $settings['description_text'] ?? '',
                        'icon' => $settings['selected_icon']['value'] ?? 'fas fa-star',
                        'url' => $settings['link']['url'] ?? null,
                        'iconColor' => $iconColor,
                        'titleColor' => $titleColor,
                        'descColor' => $descColor,
                    ],
                    'styles' => $styles,
                ];

            case 'icon-list':
                $items = [];
                foreach ($settings['icon_list'] ?? [] as $item) {
                    $items[] = [
                        'id' => $item['_id'] ?? uniqid(),
                        'text' => $item['text'] ?? '',
                        'icon' => $item['selected_icon']['value'] ?? 'fas fa-check',
                        'url' => $item['link']['url'] ?? null,
                    ];
                }
                return [
                    'id' => $id,
                    'type' => 'IconList',
                    'props' => [
                        'items' => $items,
                        'iconColor' => $settings['icon_color'] ?? '#7C3AED',
                        'textColor' => $settings['text_color'] ?? null,
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
                $rawItems = $settings['items'] ?? $settings['tabs'] ?? [];
                foreach ($rawItems as $idx => $tab) {
                    $childForTab = $children[$idx] ?? null;
                    $items[] = [
                        'id' => $tab['_id'] ?? uniqid(),
                        'title' => $tab['item_title'] ?? $tab['tab_title'] ?? ("Bölüm " . ($idx + 1)),
                        'content' => $tab['tab_content'] ?? '',
                        'child' => $childForTab,
                    ];
                }
                return [
                    'id' => $id,
                    'type' => 'Accordion',
                    'props' => [
                        'items' => $items,
                    ],
                    'styles' => $styles,
                    'children' => $children,
                ];

            case 'tabs':
            case 'nested-tabs':
                $tabs = [];
                foreach ($settings['tabs'] ?? [] as $idx => $tab) {
                    $childForTab = $children[$idx] ?? null;
                    $tabs[] = [
                        'id' => $tab['_id'] ?? uniqid(),
                        'title' => $tab['tab_title'] ?? ("Sekme " . ($idx + 1)),
                        'child' => $childForTab,
                    ];
                }
                return [
                    'id' => $id,
                    'type' => 'Tabs',
                    'props' => [
                        'tabs' => $tabs,
                    ],
                    'styles' => $styles,
                    'children' => $children,
                ];

            case 'spacer':
                $height = $settings['space']['size'] ?? 30;
                return [
                    'id' => $id,
                    'type' => 'Spacer',
                    'props' => [
                        'height' => $height . ($settings['space']['unit'] ?? 'px'),
                        'anchor' => $settings['_element_id'] ?? null,
                    ],
                    'styles' => $styles,
                ];

            case 'social-icons':
                $socials = [];
                foreach ($settings['social_icon_list'] ?? [] as $s) {
                    $socials[] = [
                        'id' => $s['_id'] ?? uniqid(),
                        'icon' => $s['social_icon']['value'] ?? 'fab fa-facebook',
                        'url' => $s['link']['url'] ?? '#',
                    ];
                }
                return [
                    'id' => $id,
                    'type' => 'SocialIcons',
                    'props' => [
                        'items' => $socials,
                        'align' => $settings['align'] ?? 'center',
                        'shape' => $settings['shape'] ?? 'rounded',
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

            case 'wpdmcategory':
                $categorySlug = $settings['catid'][0] ?? 'downloads';
                $title = !empty($settings['title']) ? ($categorySlug === 'otobusler' ? 'Otobüs Modları (OMSI2)' : ($categorySlug === 'haritalar' ? 'Harita Modları (ETS2 & OMSI2)' : ucfirst($categorySlug))) : '';
                return [
                    'id' => $id,
                    'type' => 'DownloadsList',
                    'props' => [
                        'category' => $categorySlug,
                        'title' => $title,
                        'itemsPerPage' => (int) ($settings['items_per_page'] ?? 6),
                    ],
                    'styles' => $styles,
                ];

            case 'form':
                $fields = [];
                foreach ($settings['form_fields'] ?? [] as $f) {
                    $fields[] = [
                        'id' => $f['custom_id'] ?? $f['_id'] ?? uniqid('f_'),
                        'type' => $f['field_type'] ?? 'text',
                        'label' => $f['field_label'] ?? '',
                        'placeholder' => $f['placeholder'] ?? '',
                        'required' => !empty($f['required']),
                        'options' => !empty($f['field_options']) ? explode("\n", str_replace("\r", "", $f['field_options'])) : [],
                    ];
                }
                return [
                    'id' => $id,
                    'type' => 'ContactForm',
                    'props' => [
                        'formId' => $settings['form_name'] ?? 'contact-form',
                        'title' => $settings['form_name'] ?? 'Kayıt / Başvuru Formu',
                        'buttonText' => $settings['button_text'] ?? 'Gönder',
                        'fields' => $fields,
                    ],
                    'styles' => $styles,
                ];

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

            case 'theme-site-logo':
                $imgUrl = $settings['image']['url'] ?? null;
                $logoWidth = $settings['width']['size'] ?? $settings['space']['size'] ?? 160;
                $unit = $settings['width']['unit'] ?? $settings['space']['unit'] ?? 'px';
                return [
                    'id' => $id,
                    'type' => 'SiteLogo',
                    'props' => [
                        'logoUrl' => $imgUrl,
                        'width' => is_numeric($logoWidth) ? ($logoWidth . $unit) : $logoWidth,
                        'align' => $settings['align'] ?? 'left',
                    ],
                    'styles' => $styles,
                ];

            case 'nav-menu':
                return [
                    'id' => $id,
                    'type' => 'NavMenu',
                    'props' => [
                        'menuSlug' => $settings['menu'] ?? 'header',
                        'align' => $settings['align_items'] ?? $settings['align'] ?? 'right',
                        'sticky' => !empty($settings['sticky']),
                    ],
                    'styles' => $styles,
                ];

            case 'theme-post-title':
                return [
                    'id' => $id,
                    'type' => 'Heading',
                    'props' => [
                        'text' => '{{post.title}}',
                        'level' => $settings['header_size'] ?? 'h1',
                        'align' => $settings['align'] ?? 'left',
                    ],
                    'styles' => $styles,
                ];

            case 'theme-post-featured-image':
                return [
                    'id' => $id,
                    'type' => 'Image',
                    'props' => [
                        'url' => '{{post.featured_image}}',
                        'align' => 'center',
                    ],
                    'styles' => $styles,
                ];

            case 'theme-post-content':
                return [
                    'id' => $id,
                    'type' => 'RichText',
                    'props' => [
                        'html' => '{{post.content}}',
                    ],
                    'styles' => $styles,
                ];

            case 'theme-post-excerpt':
                return [
                    'id' => $id,
                    'type' => 'RichText',
                    'props' => [
                        'html' => '{{post.excerpt}}',
                    ],
                    'styles' => $styles,
                ];

            case 'post-info':
                return [
                    'id' => $id,
                    'type' => 'RichText',
                    'props' => [
                        'html' => '<div class="text-sm text-gray-500 py-2">📅 {{post.date}}</div>',
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
        $globals = $settings['__globals__'] ?? [];

        // 1. Background
        $bg = $this->resolveColor($settings['background_color'] ?? null, $globals['background_color'] ?? null);
        if (!empty($bg)) {
            $styles['backgroundColor'] = $bg;
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
            $borderCol = $this->resolveColor($settings['border_color'] ?? null, $globals['border_color'] ?? null) ?? '#e2e8f0';
            $styles['borderColor'] = $borderCol;
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
        $m = $settings['margin'] ?? $settings['_margin'] ?? null;
        if (!empty($m) && is_array($m)) {
            $u = $m['unit'] ?? 'px';
            $styles['margin'] = "{$m['top']}{$u} {$m['right']}{$u} {$m['bottom']}{$u} {$m['left']}{$u}";
            if (isset($m['top'])) $styles['marginTop'] = "{$m['top']}{$u}";
            if (isset($m['bottom'])) $styles['marginBottom'] = "{$m['bottom']}{$u}";
            if (isset($m['left'])) $styles['marginLeft'] = "{$m['left']}{$u}";
            if (isset($m['right'])) $styles['marginRight'] = "{$m['right']}{$u}";
        }
        $p = $settings['padding'] ?? $settings['_padding'] ?? null;
        if (!empty($p) && is_array($p)) {
            $u = $p['unit'] ?? 'px';
            $styles['padding'] = "{$p['top']}{$u} {$p['right']}{$u} {$p['bottom']}{$u} {$p['left']}{$u}";
            if (isset($p['top'])) $styles['paddingTop'] = "{$p['top']}{$u}";
            if (isset($p['bottom'])) $styles['paddingBottom'] = "{$p['bottom']}{$u}";
            if (isset($p['left'])) $styles['paddingLeft'] = "{$p['left']}{$u}";
            if (isset($p['right'])) $styles['paddingRight'] = "{$p['right']}{$u}";
        }

        // 5. Typography (Global preset lookup + direct overrides)
        $globalTypoRef = $globals['typography'] ?? null;
        if ($globalTypoRef) {
            $typoPreset = $this->resolveTypography($globalTypoRef);
            if ($typoPreset) {
                if (!empty($typoPreset['typography_font_family'])) {
                    $styles['fontFamily'] = $typoPreset['typography_font_family'];
                }
                if (!empty($typoPreset['typography_font_size']['size'])) {
                    $styles['fontSize'] = $typoPreset['typography_font_size']['size'] . ($typoPreset['typography_font_size']['unit'] ?? 'px');
                }
                if (!empty($typoPreset['typography_font_weight'])) {
                    $styles['fontWeight'] = (int) $typoPreset['typography_font_weight'];
                }
                if (!empty($typoPreset['typography_line_height']['size'])) {
                    $styles['lineHeight'] = $typoPreset['typography_line_height']['size'] . ($typoPreset['typography_line_height']['unit'] ?? 'em');
                }
                if (!empty($typoPreset['typography_letter_spacing']['size'])) {
                    $styles['letterSpacing'] = $typoPreset['typography_letter_spacing']['size'] . ($typoPreset['typography_letter_spacing']['unit'] ?? 'px');
                }
                if (!empty($typoPreset['typography_text_transform'])) {
                    $styles['textTransform'] = $typoPreset['typography_text_transform'];
                }
                if (!empty($typoPreset['typography_font_style'])) {
                    $styles['fontStyle'] = $typoPreset['typography_font_style'];
                }
            }
        }

        if (!empty($settings['typography_font_size']['size'])) {
            $styles['fontSize'] = $settings['typography_font_size']['size'] . ($settings['typography_font_size']['unit'] ?? 'px');
        }
        if (!empty($settings['typography_font_weight'])) {
            $styles['fontWeight'] = (int) $settings['typography_font_weight'];
        }
        if (!empty($settings['typography_font_family'])) {
            $styles['fontFamily'] = $settings['typography_font_family'];
        }
        if (!empty($settings['typography_line_height']['size'])) {
            $styles['lineHeight'] = $settings['typography_line_height']['size'] . ($settings['typography_line_height']['unit'] ?? 'em');
        }
        if (!empty($settings['typography_letter_spacing']['size'])) {
            $styles['letterSpacing'] = $settings['typography_letter_spacing']['size'] . ($settings['typography_letter_spacing']['unit'] ?? 'px');
        }
        if (!empty($settings['typography_text_transform'])) {
            $styles['textTransform'] = $settings['typography_text_transform'];
        }
        if (!empty($settings['typography_font_style'])) {
            $styles['fontStyle'] = $settings['typography_font_style'];
        }
        $textColor = $this->resolveColor(
            $settings['text_color'] ?? $settings['title_color'] ?? null,
            $globals['text_color'] ?? $globals['title_color'] ?? null
        );
        if (!empty($textColor)) {
            $styles['color'] = $textColor;
        }
        if (!empty($settings['align'])) {
            $styles['textAlign'] = $settings['align'];
        }

        // 6. Flex layout & Gaps
        if (!empty($settings['gap']['size'])) {
            $styles['gap'] = $settings['gap']['size'] . ($settings['gap']['unit'] ?? 'px');
        } elseif (!empty($settings['flex_gap']['size'])) {
            $styles['gap'] = $settings['flex_gap']['size'] . ($settings['flex_gap']['unit'] ?? 'px');
        }
        if (!empty($settings['justify_content'])) {
            $styles['justifyContent'] = $settings['justify_content'];
        }
        if (!empty($settings['align_items'])) {
            $styles['alignItems'] = $settings['align_items'];
        }
        if (!empty($settings['flex_direction'])) {
            $styles['flexDirection'] = $settings['flex_direction'];
        }

        // 7. Animation
        if (!empty($settings['animation'])) {
            $styles['animation'] = $settings['animation'];
        }

        return $styles;
    }
}
