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
  styles?: React.CSSProperties
}

export const ImageBox: React.FC<ImageBoxProps> = ({
  title,
  description = '',
  imageUrl,
  url,
  siteSlug = 'otizmkonfederasyonu',
  styles = {},
}) => {
  const normImageUrl = normalizeMediaUrl(imageUrl, siteSlug)
  const isMinimal = !title && Boolean(description)

  const content = (
    <div
      style={styles}
      className={`flex flex-col items-center text-center p-4 transition-all duration-300 group h-full justify-between ${
        isMinimal
          ? 'bg-transparent text-white hover:scale-105'
          : 'bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {normImageUrl && (
        <div
          className={`overflow-hidden mb-3 flex items-center justify-center p-2 transition-transform duration-300 ${
            isMinimal
              ? 'w-28 h-28 sm:w-36 sm:h-36 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 group-hover:border-white/40 shadow-lg'
              : 'w-full aspect-[4/3] bg-gray-50 rounded-xl'
          }`}
        >
          <img
            src={normImageUrl}
            alt={title || description}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 flex flex-col justify-center">
        {title ? (
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition mb-2">
            {title}
          </h3>
        ) : description ? (
          <h4
            className={`text-sm sm:text-base font-bold transition leading-snug ${
              isMinimal ? 'text-white' : 'text-gray-800 group-hover:text-purple-600'
            }`}
          >
            {description}
          </h4>
        ) : null}

        {title && description && (
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
            {description}
          </p>
        )}
      </div>
    </div>
  )

  if (url) {
    return (
      <a href={url} className="block h-full">
        {content}
      </a>
    )
  }

  return content
}
