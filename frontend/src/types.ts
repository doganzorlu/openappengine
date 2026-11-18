export interface ThemeTokens {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  headingColor: string
  fontFamily: string
  backgroundColor: string
  borderRadius?: string
  isDark: boolean
}

export interface MenuItem {
  id: number
  title: string
  url: string
  target: string
}

export interface Menu {
  id: number
  name: string
  location: string
  items: MenuItem[]
}

export interface Site {
  id: number
  name: string
  slug: string
  domain: string
  description: string
  settings: Record<string, any>
  theme_config: {
    primary_color?: string
    font_family?: string
    logo_url?: string
  }
}

export interface ComponentNode {
  id: string
  type: string
  props: Record<string, any>
  styles?: Record<string, any>
  children?: ComponentNode[]
}

export interface PageData {
  id: number
  title: string
  slug: string
  is_home: boolean
  seo: {
    title?: string
    description?: string
  }
  layout: ComponentNode[]
}
