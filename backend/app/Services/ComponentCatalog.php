<?php

namespace App\Services;

class ComponentCatalog
{
    public static function getCatalog(): array
    {
        return [
            'design_system' => [
                'hierarchy' => 'Site (Global Theme) -> Page -> Container / Section -> Component',
                'color_tokens' => ['primary', 'secondary', 'accent', 'text', 'heading'],
                'standard_fonts' => ['Poppins, sans-serif', 'Roboto, sans-serif', 'Inter, sans-serif'],
                'layout_system' => 'Flexbox & CSS Grid with Tailwind utilities, boxed (max-w-6xl/max-w-7xl) or full-width',
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
                    'description' => 'H1 through H4 headings with auto theme color inheritance.',
                    'props' => [
                        'text' => ['type' => 'string', 'required' => true],
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
                    'description' => 'Interactive AJAX contact and pre-registration form with backend integration.',
                    'props' => [
                        'formSlug' => ['type' => 'string', 'default' => 'iletisim-formu'],
                        'title' => ['type' => 'string', 'default' => 'Bize Ulaşın'],
                        'buttonText' => ['type' => 'string', 'default' => 'Gönder'],
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
