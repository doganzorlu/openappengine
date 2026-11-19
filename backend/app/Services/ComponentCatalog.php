<?php

namespace App\Services;

class ComponentCatalog
{
    public static function getCatalog(): array
    {
        return [
            'site_cloning_contract' => [
                'overview' => 'CRITICAL GUIDELINES FOR AI AGENTS: When scraping, migrating, or cloning a target website into OpenAppEngine via MCP, follow this contract to achieve 100% visual and functional parity.',
                'step_1_typography_extraction' => [
                    'action' => 'Inspect the source site fonts via <head> Google Font links, document.fonts, and computed CSS (window.getComputedStyle).',
                    'detect' => [
                        'heading_font' => 'Distinguish the headline serif/display font (e.g. Playfair Display, Cinzel, Cormorant Garamond, Montserrat).',
                        'body_font' => 'Distinguish the clean body sans-serif font (e.g. Syne, Inter, Lexend Deca, Poppins).',
                        'font_weights_and_italics' => 'Check which weights (300, 400, 600, 700) and italic variants are loaded.',
                    ],
                    'how_to_apply' => 'Call update_site_theme with: { site_slug, heading_font_family: "Playfair Display, serif", font_family: "Syne, sans-serif", fonts: ["Playfair Display", "Syne", "Lexend Deca"] }. OpenAppEngine frontend will automatically inject the dynamic Google Fonts stylesheets into <head>.',
                ],
                'step_2_header_and_navbar_contract' => [
                    'action' => 'Inspect the source site navbar overlay, transparency and sticky behavior.',
                    'detect' => [
                        'is_transparent' => 'Does the hero image extend underneath a transparent floating navbar? If yes, set header_transparent: true.',
                        'is_sticky' => 'Does the header stick to top on scroll? If yes, set sticky_header: true.',
                        'header_cta' => 'Is there a call-to-action button or phone pill in the navbar? Include it in the menu or site settings.',
                    ],
                    'how_to_apply' => 'Call update_site_theme with: { site_slug, header_transparent: true, sticky_header: true }.',
                ],
                'step_3_visual_effects_contract' => [
                    'inputbox_and_form_styles' => [
                        'source_indicator' => 'Check CSS of inputs (input[type=text], select, textarea). If border-width is 0px 0px 1px 0px (or border-bottom only) and background is transparent:',
                        'how_to_apply' => 'In ContactForm props, set inputStyle: "underline" and cardStyle: "transparent". This applies the luxury editorial underline aesthetic with flush left alignment and crisp focus states.',
                    ],
                    'parallax_backgrounds' => [
                        'source_indicator' => 'Background image with CSS background-attachment: fixed, or image remaining fixed while page scrolls over it.',
                        'how_to_apply' => 'In Section props, set bgAttachment: "fixed" alongside bgImage.',
                    ],
                    'scroll_reveal_animations' => [
                        'source_indicator' => 'Sections, cards or headings sliding or fading into view upon scroll.',
                        'how_to_apply' => 'In Section props, set animation: "slideInUp" (or "fadeIn", "zoomIn", "slideInLeft", "slideInRight") and animationDelay: 150 (in milliseconds).',
                    ],
                    'editorial_italic_serif_headings' => [
                        'source_indicator' => 'Headlines where specific words are italicized or highlighted in accent serif (e.g. "DES ESPACES <i>d\'exception</i>").',
                        'how_to_apply' => 'In Heading props, put HTML directly into the text prop: text: "DES ESPACES <i>d\'exception</i>". ComponentRenderer supports <i>, <em>, and <span> formatting.',
                    ],
                ],
                'step_4_clean_relative_links' => [
                    'rule' => 'NEVER copy hardcoded legacy domains (e.g. https://oldsite.com/...) into navigation links, buttons, or anchors.',
                    'internal_links' => 'Always use root-relative paths like "/" for home, "/hakkimizda" for pages, or "#section-id" for in-page anchors.',
                    'external_links' => 'Use absolute URLs ONLY for true external third-party destinations (Instagram, WhatsApp, Google Maps).',
                ],
                'step_5_visual_verification' => [
                    'action' => 'ALWAYS call preview_page_screenshot after updating layout and theme to visually verify alignment, typography, and colors against the original website.',
                ],
            ],
            'design_system' => [
                'hierarchy' => 'Site (Global Theme) -> Page -> Container / Section -> Component',
                'color_tokens' => ['primary', 'secondary', 'accent', 'text', 'heading'],
                'standard_fonts' => ['Poppins, sans-serif', 'Roboto, sans-serif', 'Inter, sans-serif', 'Playfair Display, serif', 'Syne, sans-serif'],
                'layout_system' => 'Flexbox & CSS Grid with Tailwind utilities, boxed (max-w-6xl/max-w-7xl) or full-width',
                'theme_tokens' => [
                    'primary_color' => 'Main brand color',
                    'secondary_color' => 'Secondary accent color',
                    'heading_font_family' => 'Font family for headlines (e.g. Playfair Display, serif)',
                    'font_family' => 'Font family for body text (e.g. "Syne, sans-serif")',
                    'fonts' => 'Array of Google Font names to dynamically inject into <head>',
                    'header_transparent' => 'Boolean: transparent floating navbar overlaying hero',
                    'sticky_header' => 'Boolean: fixed sticky navbar on scroll',
                ],
                'url_rules' => [
                    'rule' => 'ALWAYS use clean relative paths for internal navigation (/about, /contact, #section). NEVER hardcode legacy domains (https://oldsite.com/...) or staging/localhost URLs.',
                    'home_url' => '/',
                    'page_url' => '/{page-slug} (e.g. /hakkimizda, /etkinlikler)',
                    'anchor_url' => '#{section-id} (e.g. #iletisim, #hizmetler)',
                    'external_url' => 'Use absolute URLs ONLY for external services (Instagram, YouTube, Google Maps, WhatsApp)',
                    'reason' => 'OpenAppEngine dynamic link resolver automatically adapts links during preview/staging and seamlessly works when production DNS is pointed without breaking.',
                ],
            ],
            'components' => [
                'Section' => [
                    'category' => 'Layout',
                    'description' => 'Top-level section wrapper for pages. Can have background image/color, shape dividers, and columns.',
                    'props' => [
                        'columns' => ['type' => 'number', 'enum' => [1, 2, 3, 4, 5, 6], 'default' => 1, 'description' => 'Multi-column grid count (1 to 6 columns)'],
                        'gap' => ['type' => 'string', 'enum' => ['none', 'sm', 'md', 'lg'], 'default' => 'md', 'description' => 'Column spacing: none (0), sm (16px), md (24px), lg (32px)'],
                        'layout' => ['type' => 'string', 'enum' => ['boxed', 'full_width'], 'default' => 'boxed'],
                        'flexDirection' => ['type' => 'string', 'enum' => ['row', 'column'], 'default' => 'row'],
                        'justifyContent' => ['type' => 'string', 'enum' => ['start', 'center', 'end', 'space-between', 'space-around'], 'default' => 'start'],
                        'alignItems' => ['type' => 'string', 'enum' => ['start', 'center', 'end', 'stretch'], 'default' => 'stretch'],
                        'bgColor' => ['type' => 'string', 'description' => 'Hex or CSS background color'],
                        'bgImage' => ['type' => 'string', 'description' => 'Media URL for background image'],
                        'bgOverlayColor' => ['type' => 'string', 'description' => 'Overlay tint color'],
                        'bgOverlayOpacity' => ['type' => 'number', 'description' => '0.0 to 1.0'],
                        'bgAttachment' => ['type' => 'string', 'enum' => ['scroll', 'fixed'], 'default' => 'scroll', 'description' => 'Set to "fixed" to enable luxury parallax background where the image stays locked as content scrolls'],
                        'animation' => ['type' => 'string', 'enum' => ['none', 'fadeIn', 'slideInUp', 'zoomIn', 'slideInLeft', 'slideInRight'], 'default' => 'none', 'description' => 'Scroll reveal animation triggered when section enters viewport'],
                        'animationDelay' => ['type' => 'number', 'default' => 0, 'description' => 'Delay in milliseconds before scroll reveal animation begins (e.g. 150, 300)'],
                        'minHeight' => ['type' => 'string|number', 'description' => 'Height in px or vh (e.g. 500, "80vh")'],
                        'shapeDividerTop' => ['type' => 'string', 'enum' => ['drops', 'waves', 'tilt', 'mountains']],
                        'shapeDividerBottom' => ['type' => 'string', 'enum' => ['drops', 'waves', 'tilt', 'mountains']],
                    ],
                    'styles' => [
                        'backgroundColor' => 'string',
                        'padding' => 'string (e.g. "60px 0px")',
                        'margin' => 'string',
                    ],
                ],
                'Column' => [
                    'category' => 'Layout',
                    'description' => 'Column container nested inside Section. Contains widgets.',
                    'props' => [
                        'width' => ['type' => 'number', 'description' => 'Percentage width: 100, 50, 33.33, 25'],
                        'flexDirection' => ['type' => 'string', 'enum' => ['column', 'row'], 'default' => 'column'],
                        'align' => ['type' => 'string', 'enum' => ['left', 'center', 'right'], 'default' => 'left'],
                    ],
                    'styles' => [
                        'backgroundColor' => 'string',
                        'padding' => 'string',
                        'borderRadius' => 'string',
                    ],
                ],
                'Heading' => [
                    'category' => 'Typography',
                    'description' => 'H1 through H4 headings with auto theme color inheritance. Supports inline HTML such as <i>editorial italic accents</i>, <em>, and <span class="..."> to match luxury magazine aesthetics.',
                    'props' => [
                        'text' => ['type' => 'string', 'required' => true, 'description' => 'Heading text. Supports HTML tags like "ESPACES <i>d\'exception</i>" for italic serif accents.'],
                        'level' => ['type' => 'string', 'enum' => ['h1', 'h2', 'h3', 'h4'], 'default' => 'h2'],
                        'align' => ['type' => 'string', 'enum' => ['left', 'center', 'right'], 'default' => 'left'],
                        'color' => ['type' => 'string', 'description' => 'Optional override; inherits from theme'],
                        'withDivider' => ['type' => 'boolean', 'default' => false],
                    ],
                    'styles' => [
                        'fontSize' => 'string',
                        'fontWeight' => 'number|string',
                        'fontFamily' => 'string',
                        'textAlign' => 'string',
                    ],
                ],
                'RichText' => [
                    'category' => 'Typography',
                    'description' => 'Formatted paragraph text supporting HTML markup (b, i, u, a, p, ul, ol, li).',
                    'props' => [
                        'html' => ['type' => 'string', 'required' => true],
                        'align' => ['type' => 'string', 'enum' => ['left', 'center', 'right', 'justify']],
                        'color' => ['type' => 'string'],
                    ],
                    'styles' => ['fontSize' => 'string', 'fontFamily' => 'string', 'color' => 'string'],
                ],
                'Button' => [
                    'category' => 'Interactive',
                    'description' => 'Call-to-action button with icon, link and color inheritance.',
                    'props' => [
                        'text' => ['type' => 'string', 'required' => true],
                        'url' => ['type' => 'string', 'required' => true],
                        'bgColor' => ['type' => 'string', 'description' => 'Defaults to theme primary color'],
                        'textColor' => ['type' => 'string'],
                        'size' => ['type' => 'string', 'enum' => ['sm', 'md', 'lg', 'xl'], 'default' => 'md'],
                        'shape' => ['type' => 'string', 'enum' => ['rounded', 'pill', 'square'], 'default' => 'rounded'],
                        'align' => ['type' => 'string', 'enum' => ['left', 'center', 'right']],
                    ],
                ],
                'PricingTable' => [
                    'category' => 'Marketing',
                    'description' => 'Pricing or donation package card with price, features list, badge, and action button.',
                    'props' => [
                        'title' => ['type' => 'string', 'required' => true],
                        'price' => ['type' => 'string', 'required' => true],
                        'period' => ['type' => 'string', 'default' => '/aylık'],
                        'badge' => ['type' => 'string', 'description' => 'e.g. Popüler, Tavsiye Edilen'],
                        'features' => ['type' => 'array of strings'],
                        'buttonText' => ['type' => 'string', 'default' => 'Hemen Başvur'],
                        'buttonUrl' => ['type' => 'string', 'default' => '#'],
                        'isFeatured' => ['type' => 'boolean', 'default' => false],
                    ],
                ],
                'TeamMember' => [
                    'category' => 'Content',
                    'description' => 'Member profile card with avatar, role, bio, and social links.',
                    'props' => [
                        'name' => ['type' => 'string', 'required' => true],
                        'role' => ['type' => 'string', 'required' => true],
                        'bio' => ['type' => 'string'],
                        'image' => ['type' => 'string', 'description' => 'Media photo URL'],
                        'email' => ['type' => 'string'],
                    ],
                ],
                'Accordion' => [
                    'category' => 'Content',
                    'description' => 'Collapsible FAQ / accordion item list.',
                    'props' => [
                        'items' => [
                            'type' => 'array of objects',
                            'items' => ['id' => 'string', 'title' => 'string', 'content' => 'string'],
                        ],
                    ],
                ],
                'Tabs' => [
                    'category' => 'Content',
                    'description' => 'Tabbed content switcher (pills or underline style).',
                    'props' => [
                        'items' => [
                            'type' => 'array of objects',
                            'items' => ['id' => 'string', 'label' => 'string', 'content' => 'string'],
                        ],
                    ],
                ],
                'Countdown' => [
                    'category' => 'Marketing',
                    'description' => 'Live animated countdown timer to an event date.',
                    'props' => [
                        'targetDate' => ['type' => 'string', 'format' => 'YYYY-MM-DDTHH:mm:ss'],
                        'title' => ['type' => 'string'],
                        'subtitle' => ['type' => 'string'],
                    ],
                ],
                'ContactForm' => [
                    'category' => 'Forms',
                    'description' => 'Interactive AJAX contact, lead generation and pre-registration form supporting inline, multi-step wizard and modal display modes.',
                    'props' => [
                        'formId' => ['type' => 'string', 'default' => 'contact-studio', 'description' => 'Target form slug in backend'],
                        'title' => ['type' => 'string', 'default' => 'Bize Ulaşın'],
                        'buttonText' => ['type' => 'string', 'default' => 'Gönder'],
                        'buttonBgColor' => ['type' => 'string', 'description' => 'Hex color for submit button (e.g. #222222)'],
                        'buttonShape' => ['type' => 'string', 'enum' => ['pill', 'rounded', 'square'], 'default' => 'pill'],
                        'cardStyle' => ['type' => 'string', 'enum' => ['transparent', 'minimal', 'boxed'], 'default' => 'transparent'],
                        'inputStyle' => [
                            'type' => 'string',
                            'enum' => ['underline', 'boxed', 'minimal'],
                            'default' => 'underline',
                            'description' => 'Input box style: "underline" (luxury bottom-border only, 0 padding left, matching high-end editorial designs like L\'AGENCE), "boxed" (classic rounded 4-border box), "minimal" (semi-transparent border)',
                        ],
                        'displayMode' => [
                            'type' => 'string',
                            'enum' => ['inline', 'multistep', 'modal'],
                            'default' => 'inline',
                            'description' => 'Presentation format: "inline" (standard embedded), "multistep" (interactive step-by-step wizard with progress bar), "modal" (lightbox popup window)',
                        ],
                        'modalTriggerText' => ['type' => 'string', 'default' => 'Teklif Alın →'],
                    ],
                ],
                'GoogleMap' => [
                    'category' => 'Media',
                    'description' => 'Interactive embedded Google Maps view.',
                    'props' => [
                        'query' => ['type' => 'string', 'default' => 'Çanakkale Onsekiz Mart Üniversitesi'],
                        'height' => ['type' => 'number', 'default' => 380],
                    ],
                ],
                'PostGrid' => [
                    'category' => 'Dynamic',
                    'description' => 'Dynamic news / blog posts grid connected to CMS posts.',
                    'props' => [
                        'title' => ['type' => 'string', 'default' => 'Güncel Haberler'],
                        'limit' => ['type' => 'number', 'default' => 6],
                    ],
                ],
                'LogoTicker' => [
                    'category' => 'Marketing',
                    'description' => 'Infinite seamless scrolling marquee of partner / sponsor logos.',
                    'props' => [
                        'items' => [
                            'type' => 'array of objects',
                            'items' => ['name' => 'string', 'image' => 'string', 'url' => 'string'],
                        ],
                    ],
                ],
                'CallToAction' => [
                    'category' => 'Marketing',
                    'description' => 'High-conversion CTA banner box with title, description, and button.',
                    'props' => [
                        'title' => ['type' => 'string'],
                        'description' => ['type' => 'string'],
                        'buttonText' => ['type' => 'string'],
                        'buttonUrl' => ['type' => 'string'],
                    ],
                ],
            ],
            'ready_templates' => [
                'hero_banner' => [
                    'type' => 'Section',
                    'props' => [
                        'layout' => 'boxed',
                        'bgColor' => '#023E8A',
                        'minHeight' => '420px',
                        'alignItems' => 'center',
                        'justifyContent' => 'center',
                    ],
                    'styles' => ['padding' => '80px 20px', 'backgroundColor' => '#023E8A'],
                    'children' => [
                        [
                            'type' => 'Column',
                            'props' => ['width' => 100, 'align' => 'center'],
                            'children' => [
                                ['type' => 'Heading', 'props' => ['text' => 'Geleceğe Umutla Bakıyoruz', 'level' => 'h1', 'align' => 'center', 'color' => '#ffffff']],
                                ['type' => 'RichText', 'props' => ['html' => '<p>Müziğin iyileştirici gücüyle otizmli bireylerin hayatına dokunuyoruz.</p>', 'align' => 'center', 'color' => '#e2e8f0']],
                                ['type' => 'Button', 'props' => ['text' => 'Ön Kayıt Yap', 'url' => '#kayit', 'bgColor' => '#F77F00', 'textColor' => '#ffffff', 'size' => 'lg', 'shape' => 'pill']],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
