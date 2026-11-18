import React, { useState, useEffect } from 'react'
import type { Menu, Site } from '../types'
import { normalizeMediaUrl, resolveSiteUrl, handleInternalLinkClick } from './ImageBox'

interface NavbarProps {
  site: Site
  menus: Menu[]
  isEngineBarVisible?: boolean
}

export const Navbar: React.FC<NavbarProps> = ({ site, menus, isEngineBarVisible = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isTransparent = Boolean(site.settings?.header_transparent || site.theme_config?.header_transparent)
  const headerMenu = menus.find((m) => m.location === 'header') || menus[0]
  const rawLogoUrl = site.settings?.logo_url || site.theme_config?.logo_url
  const logoUrl = rawLogoUrl ? normalizeMediaUrl(rawLogoUrl, site.slug) : ''
  const hideBrandText = Boolean(site.settings?.hide_brand_text || site.settings?.logo_only || (logoUrl && site.theme_config?.logo_url))

  const ctaText = site.settings?.header_cta_text || (site.theme_config as any)?.header_cta_text
  const ctaUrl = site.settings?.header_cta_url || (site.theme_config as any)?.header_cta_url

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isScrolledPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('scrolled') === '1'
  const isScrolledActive = scrolled || isScrolledPreview
  const topPosition = isEngineBarVisible ? 'top-14' : 'top-0'

  const headerClass = isTransparent
    ? `fixed ${topPosition} inset-x-0 z-40 transition-all duration-300 ${
        isScrolledActive
          ? 'bg-neutral-950/85 backdrop-blur-md text-white shadow-xl border-b border-white/10'
          : 'bg-transparent text-white border-b border-transparent'
      }`
    : `sticky ${topPosition} z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300`

  const navItemClass = isTransparent
    ? 'px-3.5 py-2 rounded-lg text-sm font-semibold tracking-wide text-white/90 hover:text-white hover:bg-white/10 transition-all'
    : 'px-3.5 py-2 rounded-lg text-sm font-semibold tracking-wide text-gray-700 hover:text-neutral-950 hover:bg-gray-100 transition-all'

  return (
    <header className={headerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <a
          href={resolveSiteUrl('/', site.slug, site.domain)}
          onClick={(e) => handleInternalLinkClick(e, resolveSiteUrl('/', site.slug, site.domain))}
          className="flex items-center space-x-3 group"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={site.name}
              className={`h-10 sm:h-12 w-auto max-w-[200px] object-contain group-hover:scale-105 transition-transform ${
                isTransparent ? 'brightness-0 invert' : ''
              }`}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-pink-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
              {site.name.charAt(0)}
            </div>
          )}

          {!hideBrandText && (
            <div>
              <span className={`font-extrabold text-base sm:text-xl tracking-tight block transition-colors ${
                isTransparent ? 'text-white' : 'text-gray-900 group-hover:text-purple-700'
              }`}>
                {site.name}
              </span>
              {site.description && (
                <span className={`text-[11px] sm:text-xs font-medium block line-clamp-1 ${
                  isTransparent ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {site.description}
                </span>
              )}
            </div>
          )}
        </a>

        {/* Desktop Menu & CTA */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {headerMenu && (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {headerMenu.items.map((item) => {
                const itemUrl = resolveSiteUrl(item.url, site.slug, site.domain)
                return (
                  <a
                    key={item.id}
                    href={itemUrl}
                    target={item.target || '_self'}
                    onClick={(e) => handleInternalLinkClick(e, itemUrl)}
                    className={navItemClass}
                  >
                    {item.title}
                  </a>
                )
              })}
            </nav>
          )}

          {ctaText && ctaUrl && (
            <a
              href={ctaUrl}
              target={ctaUrl.startsWith('http') ? '_blank' : '_self'}
              className={`hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 ${
                isTransparent
                  ? 'bg-white text-neutral-900 hover:bg-neutral-100 shadow-md shadow-black/20'
                  : 'bg-neutral-900 text-white hover:bg-black'
              }`}
            >
              <span>{ctaText}</span>
              <span className="text-[11px]">→</span>
            </a>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isTransparent
                ? 'text-white hover:bg-white/10'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && headerMenu && (
        <div className={`md:hidden px-4 pt-2 pb-6 space-y-1 border-b shadow-2xl ${
          isTransparent && !scrolled
            ? 'bg-neutral-950/95 text-white border-white/10'
            : 'bg-white text-gray-900 border-gray-100'
        }`}>
          {headerMenu.items.map((item) => {
            const itemUrl = resolveSiteUrl(item.url, site.slug, site.domain)
            return (
              <a
                key={item.id}
                href={itemUrl}
                onClick={(e) => {
                  handleInternalLinkClick(e, itemUrl)
                  setMobileMenuOpen(false)
                }}
                className="block px-4 py-3 rounded-lg text-base font-semibold hover:bg-white/10"
              >
                {item.title}
              </a>
            )
          })}
          {ctaText && ctaUrl && (
            <div className="pt-2">
              <a
                href={ctaUrl}
                target={ctaUrl.startsWith('http') ? '_blank' : '_self'}
                className="block w-full text-center py-3 rounded-xl bg-white text-black font-bold text-sm shadow-md"
              >
                {ctaText} →
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
