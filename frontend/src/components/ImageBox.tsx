import React from 'react'

export function normalizeMediaUrl(url?: string | null, siteSlug: string = 'otizmkonfederasyonu'): string {
  if (!url) return ''
  if (url.startsWith('/storage/')) return url
  let clean = url.replace(/^https?:\/\/[^\/]+/, '')
  if (clean.includes('/wp-content/uploads/')) {
    clean = clean.replace(/.*?\/wp-content\/uploads\//, `/storage/sites/${siteSlug}/media/`)
  }
  return clean
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
    const isExternal = url.startsWith('http://') || url.startsWith('https://')
    return (
      <a
        href={url}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        onClick={(e) => {
          if (url.includes('post=')) {
            e.preventDefault()
            const params = new URLSearchParams(url.split('?')[1] || '')
            const postSlug = params.get('post')
            if (postSlug) {
              window.dispatchEvent(new CustomEvent('openappengine:open-post', { detail: { slug: postSlug } }))
            }
          }
        }}
        className="block h-full"
      >
        {content}
      </a>
    )
  }

  return content
}
