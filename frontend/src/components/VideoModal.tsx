import React, { useState } from 'react'

interface VideoModalProps {
  videoUrl: string
  coverImage?: string
  title?: string
  subtitle?: string
  playButtonText?: string
  accentColor?: string
  height?: number
}

export const VideoModal: React.FC<VideoModalProps> = ({
  videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  coverImage = '/storage/sites/berilzorlu/media/2016/05/beril-afis-4-150x150.jpg',
  title = 'Otizm ve Müzik Yaz Okulu Belgeseli',
  subtitle = 'Konser ve Eğitimin Dönüştürücü Gücü',
  playButtonText = 'Videoyu İzle',
  accentColor = '#FFB92C',
  height = 420,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const getEmbedUrl = (url: string) => {
    if (!url) return ''
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]
      return `https://player.vimeo.com/video/${id}?autoplay=1`
    }
    return url
  }

  return (
    <div className="w-full my-6 max-w-4xl mx-auto">
      {/* Thumbnail Card with Glowing Play Button */}
      <div
        onClick={() => setIsOpen(true)}
        style={{ height: `${height}px` }}
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl cursor-pointer group bg-black"
      >
        {coverImage && (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-90"
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        {/* Center Animated Play Button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
          <div className="relative mb-4">
            {/* Ripple Pulse Rings */}
            <span
              style={{ backgroundColor: accentColor }}
              className="absolute inset-0 rounded-full animate-ping opacity-35"
            />
            <span
              style={{ backgroundColor: accentColor }}
              className="absolute -inset-3 rounded-full animate-pulse opacity-20"
            />
            <div
              style={{ backgroundColor: accentColor }}
              className="relative w-20 h-20 rounded-full flex items-center justify-center text-slate-900 text-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300"
            >
              <span className="ml-1 font-bold">▶</span>
            </div>
          </div>

          {subtitle && (
            <div
              style={{ color: accentColor }}
              className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-1 drop-shadow"
            >
              {subtitle}
            </div>
          )}
          {title && (
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white max-w-xl drop-shadow-md">
              {title}
            </h3>
          )}
          {playButtonText && (
            <div className="mt-4 px-5 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider group-hover:bg-white group-hover:text-black transition">
              {playButtonText}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white text-3xl font-light p-2 cursor-pointer transition"
            >
              ✕
            </button>

            <iframe
              src={getEmbedUrl(videoUrl)}
              title={title}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  )
}
