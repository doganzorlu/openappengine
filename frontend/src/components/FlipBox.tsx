import React, { useState } from 'react'

interface FlipBoxProps {
  frontIcon?: string
  frontTitle: string
  frontSubtitle?: string
  frontBg?: string
  frontTextColor?: string
  backTitle?: string
  backDescription: string
  buttonText?: string
  buttonUrl?: string
  backBg?: string
  backTextColor?: string
  accentColor?: string
  minHeight?: number
}

export const FlipBox: React.FC<FlipBoxProps> = ({
  frontIcon = '🎹',
  frontTitle = 'Eğitim & Atölye',
  frontSubtitle,
  frontBg = '#FFFFFF',
  frontTextColor = '#1F2937',
  backTitle,
  backDescription = 'Detaylı açıklama ve atölye bilgileri burada yer alır.',
  buttonText = 'İncele',
  buttonUrl = '#',
  backBg = '#023E8A',
  backTextColor = '#FFFFFF',
  accentColor = '#FFB92C',
  minHeight = 320,
}) => {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="w-full max-w-sm mx-auto my-3 cursor-pointer select-none group"
      style={{ perspective: '1000px', minHeight: `${minHeight}px` }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: `${minHeight}px`,
        }}
        className="relative w-full h-full rounded-3xl transition-transform duration-700 shadow-md hover:shadow-2xl"
      >
        {/* Front Face */}
        <div
          style={{
            backgroundColor: frontBg,
            color: frontTextColor,
            backfaceVisibility: 'hidden',
          }}
          className="absolute inset-0 w-full h-full rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-gray-100/80 shadow-inner overflow-hidden"
        >
          {frontIcon && (
            <div
              style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5 shadow-xs"
            >
              {frontIcon}
            </div>
          )}
          <h3 className="text-xl font-bold mb-2 tracking-tight">
            {frontTitle}
          </h3>
          {frontSubtitle && (
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              {frontSubtitle}
            </p>
          )}
          <div className="mt-6 text-xs text-gray-400 font-bold flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
            <span>Çevir</span>
            <span>↺</span>
          </div>
        </div>

        {/* Back Face */}
        <div
          style={{
            backgroundColor: backBg,
            color: backTextColor,
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
          }}
          className="absolute inset-0 w-full h-full rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-white/10 shadow-2xl overflow-hidden"
        >
          <h4 className="text-lg font-bold mb-3 tracking-tight">
            {backTitle || frontTitle}
          </h4>
          <p className="text-xs sm:text-sm leading-relaxed mb-6 opacity-90">
            {backDescription}
          </p>
          {buttonText && (
            <a
              href={buttonUrl}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: accentColor, color: '#0F172A' }}
              className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:brightness-110 transition cursor-pointer"
            >
              {buttonText} →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
