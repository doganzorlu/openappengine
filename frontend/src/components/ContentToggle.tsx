import React, { useState } from 'react'

interface ContentToggleProps {
  labelPrimary: string
  labelSecondary: string
  badgeSecondary?: string
  contentPrimary?: string
  contentSecondary?: string
  accentColor?: string
}

export const ContentToggle: React.FC<ContentToggleProps> = ({
  labelPrimary = 'Aylık Düzenli Destek',
  labelSecondary = 'Tek Seferlik Destek',
  badgeSecondary = 'Önerilen',
  contentPrimary = '<div class="text-center p-6 bg-purple-50/50 rounded-2xl border border-purple-100 text-gray-700"><strong>Aylık Destek:</strong> Her ay düzenli bir öğrencinin eğitim bursunu ve çalgı masraflarını karşılayın.</div>',
  contentSecondary = '<div class="text-center p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-gray-700"><strong>Tek Seferlik Destek:</strong> Dilediğiniz tutarda tek seferlik bağış ile müzik yaz okulu fonuna katkı sağlayın.</div>',
  accentColor = '#4F46E5',
}) => {
  const [isSecondary, setIsSecondary] = useState(false)

  return (
    <div className="w-full my-6 max-w-3xl mx-auto">
      {/* Switcher Bar */}
      <div className="flex items-center justify-center gap-4 mb-6 select-none">
        <span
          onClick={() => setIsSecondary(false)}
          className={`text-xs sm:text-sm font-bold cursor-pointer transition ${
            !isSecondary ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {labelPrimary}
        </span>

        {/* Toggle Pill */}
        <button
          type="button"
          onClick={() => setIsSecondary(!isSecondary)}
          style={{ backgroundColor: isSecondary ? accentColor : '#CBD5E1' }}
          className="relative w-14 h-8 rounded-full p-1 transition-colors duration-300 cursor-pointer shadow-inner"
        >
          <div
            className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
              isSecondary ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>

        <span
          onClick={() => setIsSecondary(true)}
          className={`text-xs sm:text-sm font-bold cursor-pointer transition flex items-center gap-2 ${
            isSecondary ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span>{labelSecondary}</span>
          {badgeSecondary && (
            <span
              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            >
              {badgeSecondary}
            </span>
          )}
        </span>
      </div>

      {/* Dynamic Content Container */}
      <div className="transition-all duration-300">
        <div
          dangerouslySetInnerHTML={{
            __html: isSecondary ? contentSecondary : contentPrimary,
          }}
        />
      </div>
    </div>
  )
}
