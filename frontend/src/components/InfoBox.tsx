import React from 'react'

interface InfoBoxProps {
  icon?: string
  badge?: string
  title: string
  description: string
  buttonText?: string
  buttonUrl?: string
  accentColor?: string
  cardBg?: string
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  icon = '⭐',
  badge,
  title = 'Hizmet & Özellik Başlığı',
  description = 'Hizmet veya atölye içeriğini detaylandıran açıklama metni.',
  buttonText = 'Daha Fazla Bilgi',
  buttonUrl = '#',
  accentColor = '#4F46E5',
  cardBg = '#FFFFFF',
}) => {
  return (
    <div
      style={{ backgroundColor: cardBg }}
      className="group relative rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between max-w-sm w-full mx-auto my-3 overflow-hidden"
    >
      {/* Top Accent Strip on Hover */}
      <div
        style={{ backgroundColor: accentColor }}
        className="absolute top-0 left-0 right-0 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      {badge && (
        <span
          style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
          className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
        >
          {badge}
        </span>
      )}

      <div>
        {/* Icon */}
        {icon && (
          <div
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300"
          >
            {icon}
          </div>
        )}

        {/* Content */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2.5 group-hover:text-purple-700 transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6">
          {description}
        </p>
      </div>

      {/* Action Link */}
      {buttonText && (
        <div className="pt-4 border-t border-gray-50">
          <a
            href={buttonUrl}
            style={{ color: accentColor }}
            className="text-xs sm:text-sm font-bold flex items-center gap-1.5 hover:gap-3 transition-all"
          >
            <span>{buttonText}</span>
            <span className="text-base">→</span>
          </a>
        </div>
      )}
    </div>
  )
}
