import React from 'react'

export function normalizeMediaUrl(url?: string | null, siteSlug: string = 'otizmkonfederasyonu'): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (trimmed.startsWith('/storage/')) return trimmed
  if (trimmed.startsWith('data:')) return trimmed
  if (trimmed.startsWith('blob:')) return trimmed

  // If it's a full URL, keep it intact so remote CDN and live site assets load reliably
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // If it's a relative uploads path, map to local site media storage
  if (trimmed.startsWith('/wp-content/uploads/')) {
    return `/storage/sites/${siteSlug}/media/` + trimmed.replace(/^\/wp-content\/uploads\//, '')
  }

  return trimmed
}

export function resolveSiteUrl(
  url?: string | null,
  siteSlug: string = 'otizmkonfederasyonu',
  siteDomain?: string
): string {
  if (!url) return '#'
  const trimmed = url.trim()

  // 1. Anchors (#iletisim), tel, mailto, javascript
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('javascript:')
  ) {
    return trimmed
  }

  // 2. If it's an absolute URL, check if it belongs to the site itself
  let path = trimmed
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed)
      const isInternalDomain =
        (siteDomain && (parsed.hostname === siteDomain || parsed.hostname.endsWith('.' + siteDomain))) ||
        (siteSlug && parsed.hostname.includes(siteSlug)) ||
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1'

      if (isInternalDomain) {
        path = parsed.pathname + parsed.search + parsed.hash
      } else {
        // External link (Instagram, YouTube, Google, etc.) -> keep as is!
        return trimmed
      }
    } catch {
      return trimmed
    }
  }

  // 3. Clean up path
  const cleanPath = path.replace(/^\/+/, '')

  // Detect whether we are running under Custom Production Domain (DNS directed)
  const isCustomDomain =
    typeof window !== 'undefined' &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1') &&
    !window.location.pathname.startsWith('/sites/')

  // Root / Home
  if (!cleanPath || cleanPath === '/') {
    return isCustomDomain ? '/' : `/?site=${siteSlug}`
  }

  // If it already has query parameters (e.g. ?page=...)
  if (cleanPath.startsWith('?')) {
    if (!cleanPath.includes('site=')) {
      return `/?site=${siteSlug}&${cleanPath.substring(1)}`
    }
    return `/${cleanPath}`
  }

  // Normal subpage slug (e.g. "hakkinda" or "hakkinda/")
  const pageSlug = cleanPath.split('/')[0].split('?')[0].split('#')[0]

  if (isCustomDomain) {
    return `/${cleanPath}`
  }

  // Staging / Localhost / Subpath access mode:
  return `/?site=${siteSlug}&page=${pageSlug}`
}

export function handleInternalLinkClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  resolvedUrl: string
) {
  if (
    !resolvedUrl ||
    resolvedUrl === '#' ||
    resolvedUrl.startsWith('http://') ||
    resolvedUrl.startsWith('https://') ||
    resolvedUrl.startsWith('#') ||
    resolvedUrl.startsWith('mailto:') ||
    resolvedUrl.startsWith('tel:')
  ) {
    return
  }

  // If internal page navigation in SPA mode:
  if (typeof window !== 'undefined' && (resolvedUrl.includes('page=') || resolvedUrl.startsWith('/'))) {
    e.preventDefault()
    window.history.pushState({}, '', resolvedUrl)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}

interface ImageBoxProps {
  title: string
  description?: string
  imageUrl?: string
  url?: string
  siteSlug?: string
  aspectRatio?: 'poster' | 'icon' | 'default'
  titleTop?: boolean
  styles?: React.CSSProperties
}

export const ImageBox: React.FC<ImageBoxProps> = ({
  title,
  description = '',
  imageUrl,
  url,
  siteSlug = 'otizmkonfederasyonu',
  aspectRatio = 'default',
  titleTop = false,
  styles = {},
}) => {
  const normImageUrl = normalizeMediaUrl(imageUrl, siteSlug)
  const isMinimal = !title && Boolean(description)
  const isIconCard = aspectRatio === 'icon'
  const isPosterCard = aspectRatio === 'poster'

  const content = (
    <div
      style={styles}
      className={`flex flex-col items-center text-center transition-all duration-300 group h-full justify-between ${
        isMinimal
          ? 'p-4 bg-transparent text-white hover:scale-105'
          : isIconCard
          ? 'p-6 bg-white rounded-2xl shadow-sm border border-gray-100/80 hover:shadow-xl hover:-translate-y-1.5 w-full'
          : 'p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {titleTop && title && (
        <h3 className="text-base sm:text-lg font-extrabold text-[#023E8A] group-hover:text-[#0077B6] transition mb-3">
          {title}
        </h3>
      )}

      {normImageUrl && (
        <div
          className={`overflow-hidden mb-4 flex items-center justify-center transition-transform duration-300 ${
            isMinimal
              ? 'w-28 h-28 sm:w-36 sm:h-36 p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 group-hover:border-white/40 shadow-lg'
              : isIconCard
              ? 'w-24 h-24 sm:w-28 sm:h-28 mx-auto p-2 bg-blue-50/50 rounded-2xl border border-blue-100/60 group-hover:scale-105 shadow-sm'
              : isPosterCard
              ? 'w-full aspect-[3/4] bg-gray-50 rounded-lg p-1'
              : 'w-full aspect-[4/3] bg-gray-50 rounded-xl p-2'
          }`}
        >
          <img
            src={normImageUrl}
            alt={title || description}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center w-full">
        {!titleTop && title ? (
          <h3 className="text-sm sm:text-base font-extrabold text-[#023E8A] group-hover:text-[#0077B6] transition mb-1.5 uppercase tracking-wide">
            {title}
          </h3>
        ) : !title && description ? (
          <h4
            className={`text-sm sm:text-base font-bold transition leading-snug ${
              isMinimal ? 'text-white' : 'text-gray-800 group-hover:text-purple-600'
            }`}
          >
            {description}
          </h4>
        ) : null}

        {title && description && (
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
            {description}
          </p>
        )}
      </div>
    </div>
  )

  if (url) {
    const resolvedUrl = resolveSiteUrl(url, siteSlug)
    const isExternal = resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://')
    return (
      <a
        href={resolvedUrl}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        onClick={(e) => {
          if (resolvedUrl.includes('post=')) {
            e.preventDefault()
            const params = new URLSearchParams(resolvedUrl.split('?')[1] || '')
            const postSlug = params.get('post')
            if (postSlug) {
              window.dispatchEvent(new CustomEvent('openappengine:open-post', { detail: { slug: postSlug } }))
            }
            return
          }
          handleInternalLinkClick(e, resolvedUrl)
        }}
        className="block h-full"
      >
        {content}
      </a>
    )
  }

  return content
}
