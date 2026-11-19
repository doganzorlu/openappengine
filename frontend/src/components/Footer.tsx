import React from 'react'
import type { Site } from '../types'

interface FooterProps {
  site: Site
}

export const Footer: React.FC<FooterProps> = ({ site }) => {
  const footerBg = (site.settings as any)?.footer_bg || (site.theme_config as any)?.footer_bg
  const isLightFooter = footerBg && !['#000', '#111', '#051324', '#0f172a', '#1e293b', 'rgb(0', 'rgba(0'].some(c => footerBg.toLowerCase().startsWith(c))

  if (isLightFooter) {
    return (
      <footer className="py-6 border-t border-neutral-300/80" style={{ backgroundColor: footerBg, color: '#444444' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs tracking-wide text-gray-700">
          <p>Copyright © {new Date().getFullYear()} - {site.name}</p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h4 className="text-white text-lg font-bold">{site.name}</h4>
          <p className="text-xs text-gray-500 mt-1">{site.description}</p>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>© {new Date().getFullYear()} {site.name}. Tüm hakları saklıdır.</p>
          <p className="text-gray-600">
            Powered by <span className="font-semibold text-gray-400">OpenAppEngine</span> (PHP 8.3 & React)
          </p>
        </div>
      </div>
    </footer>
  )
}
