import React from 'react'

interface ImageBoxProps {
  title: string
  description?: string
  imageUrl?: string
  url?: string
  styles?: React.CSSProperties
}

export const ImageBox: React.FC<ImageBoxProps> = ({
  title,
  description = '',
  imageUrl,
  url,
  styles = {},
}) => {
  const content = (
    <div
      style={styles}
      className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full"
    >
      {imageUrl && (
        <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-gray-50 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {description}
        </p>
      )}
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
