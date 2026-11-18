import React from 'react'

interface CallToActionProps {
  title: string
  subtitle?: string
  description?: string
  buttonText?: string
  buttonUrl?: string
  secondaryButtonText?: string
  secondaryButtonUrl?: string
  accentColor?: string
  bgColor?: string
  textColor?: string
  layout?: 'centered' | 'left-aligned'
}

export const CallToAction: React.FC<CallToActionProps> = ({
  title,
  subtitle,
  description,
  buttonText = 'Hemen Başvurun',
  buttonUrl = '#',
  secondaryButtonText,
  secondaryButtonUrl,
  accentColor = '#FFB92C',
  bgColor = '#0F172A',
  textColor = '#FFFFFF',
  layout = 'centered',
}) => {
  const isCentered = layout === 'centered'

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className={`rounded-3xl p-8 sm:p-12 md:p-14 my-6 shadow-2xl relative overflow-hidden max-w-5xl mx-auto ${
        isCentered ? 'text-center' : 'text-left flex flex-col md:flex-row items-center justify-between gap-8'
      }`}
    >
      {/* Decorative Background Blob */}
      <div
        style={{
          background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`,
        }}
        className="absolute -top-24 -right-24 w-96 h-96 pointer-events-none rounded-full blur-2xl"
      />

      {/* Content */}
      <div className={`relative z-10 ${isCentered ? 'max-w-3xl mx-auto' : 'max-w-xl'}`}>
        {subtitle && (
          <div
            style={{ color: accentColor }}
            className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-2.5"
          >
            {subtitle}
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6">
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div
        className={`relative z-10 flex flex-wrap items-center gap-3.5 ${
          isCentered ? 'justify-center' : 'shrink-0'
        }`}
      >
        {buttonText && (
          <a
            href={buttonUrl}
            style={{ backgroundColor: accentColor, color: '#0F172A' }}
            className="px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base shadow-lg hover:brightness-110 hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <span>{buttonText}</span>
            <span className="text-lg">→</span>
          </a>
        )}
        {secondaryButtonText && (
          <a
            href={secondaryButtonUrl || '#'}
            className="px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base text-white border border-white/20 hover:bg-white/10 transition-all duration-200"
          >
            {secondaryButtonText}
          </a>
        )}
      </div>
    </div>
  )
}
