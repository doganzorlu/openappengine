import React, { useState } from 'react'
import type { Menu, Site } from '../types'
import { normalizeMediaUrl, resolveSiteUrl, handleInternalLinkClick } from './ImageBox'

interface NavbarProps {
  site: Site
  menus: Menu[]
}

export const Navbar: React.FC<NavbarProps> = ({ site, menus }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const headerMenu = menus.find((m) => m.location === 'header') || menus[0]
  const rawLogoUrl = site.settings?.logo_url || site.theme_config?.logo_url
  const logoUrl = rawLogoUrl ? normalizeMediaUrl(rawLogoUrl, site.slug) : ''

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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
              className="h-12 sm:h-14 w-auto max-w-[160px] object-contain group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-pink-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
              {site.name.charAt(0)}
            </div>
          )}
          <div>
            <span className="font-extrabold text-base sm:text-xl text-gray-900 tracking-tight block group-hover:text-purple-700 transition-colors">
              {site.name}
            </span>
            {site.description && (
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium block line-clamp-1">
                {site.description}
              </span>
            )}
          </div>
        </a>

        {/* Desktop Menu */}
        {headerMenu && (
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {headerMenu.items.map((item) => {
              const itemUrl = resolveSiteUrl(item.url, site.slug, site.domain)
              return (
                <a
                  key={item.id}
                  href={itemUrl}
                  target={item.target || '_self'}
                  onClick={(e) => handleInternalLinkClick(e, itemUrl)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition-all"
                >
                  {item.title}
                </a>
              )
            })}
          </nav>
        )}

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && headerMenu && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 space-y-1">
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
                className="block px-4 py-3 rounded-lg text-base font-semibold text-gray-800 hover:bg-purple-50 hover:text-purple-700"
              >
                {item.title}
              </a>
            )
          })}
        </div>
      )}
    </header>
  )
}
