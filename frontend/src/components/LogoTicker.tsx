import React from 'react'

export interface TickerLogo {
  id?: string | number
  name: string
  imageUrl: string
  url?: string
}

interface LogoTickerProps {
  logos?: TickerLogo[]
  speed?: 'slow' | 'normal' | 'fast'
  grayscale?: boolean
  pauseOnHover?: boolean
  direction?: 'left' | 'right'
}

export const LogoTicker: React.FC<LogoTickerProps> = ({
  logos = [],
  speed = 'normal',
  grayscale = true,
  pauseOnHover = true,
  direction = 'left',
}) => {
  const defaultLogos: TickerLogo[] = [
    { id: '1', name: 'Çanakkale Onsekiz Mart Üniversitesi', imageUrl: '/storage/sites/otizmuzikokulu/media/2025/02/omyo_logo.png' },
    { id: '2', name: 'Afyon Kocatepe Üniversitesi', imageUrl: '/storage/sites/otizmuzikokulu/media/2025/02/omyo_logo.png' },
    { id: '3', name: 'Otizm Konfederasyonu', imageUrl: '/storage/sites/otizmuzikokulu/media/2025/02/omyo_logo.png' },
    { id: '4', name: 'ODER Otizm Derneği', imageUrl: '/storage/sites/otizmuzikokulu/media/2025/02/omyo_logo.png' },
  ]

  const items = logos.length > 0 ? logos : defaultLogos

  // Duplicate items twice to ensure smooth infinite loop
  const duplicatedItems = [...items, ...items, ...items]

  const durationClass =
    speed === 'slow' ? 'duration-[45s]' : speed === 'fast' ? 'duration-[15s]' : 'duration-[28s]'

  return (
    <div className="w-full my-6 overflow-hidden py-6 relative select-none group/ticker">
      {/* Subtle fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div
        className={`flex items-center gap-12 sm:gap-16 w-max animate-ticker ${durationClass} ${
          direction === 'right' ? 'direction-reverse' : ''
        } ${pauseOnHover ? 'group-hover/ticker:[animation-play-state:paused]' : ''}`}
      >
        {duplicatedItems.map((logo, index) => {
          const content = (
            <div
              key={`${logo.id || index}-${index}`}
              className={`flex items-center justify-center h-16 sm:h-20 max-w-[180px] sm:max-w-[220px] transition-all duration-300 ${
                grayscale ? 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:scale-105' : 'hover:scale-105'
              }`}
              title={logo.name}
            >
              <img
                src={logo.imageUrl}
                alt={logo.name}
                loading="lazy"
                className="max-h-full max-w-full object-contain filter drop-shadow-xs"
              />
            </div>
          )

          if (logo.url) {
            return (
              <a
                key={`${logo.id || index}-${index}`}
                href={logo.url}
                target="_blank"
                rel="noreferrer"
                className="block cursor-pointer focus:outline-hidden"
              >
                {content}
              </a>
            )
          }

          return content
        })}
      </div>
    </div>
  )
}
