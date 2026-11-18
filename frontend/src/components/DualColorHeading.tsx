import React from 'react'

interface DualColorHeadingProps {
  firstText: string
  secondText: string
  firstColor?: string
  secondColor?: string
  secondStyle?: 'text' | 'highlight' | 'gradient'
  level?: 'h1' | 'h2' | 'h3'
  align?: 'left' | 'center' | 'right'
  subtitle?: string
}

export const DualColorHeading: React.FC<DualColorHeadingProps> = ({
  firstText = 'Farklı Gelişen Bireylerde ',
  secondText = 'Müzik Terapisi',
  firstColor = '#1E293B',
  secondColor = '#4F46E5',
  secondStyle = 'gradient',
  level = 'h2',
  align = 'center',
  subtitle,
}) => {
  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'

  const renderSecondText = () => {
    switch (secondStyle) {
      case 'highlight':
        return (
          <span
            style={{ backgroundColor: `${secondColor}22`, color: secondColor }}
            className="px-3.5 py-1 rounded-2xl inline-block ml-1.5 shadow-xs border border-current/20"
          >
            {secondText}
          </span>
        )
      case 'gradient':
        return (
          <span
            style={{
              backgroundImage: `linear-gradient(135deg, ${secondColor} 0%, #EC4899 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            className="inline-block ml-1.5 font-black"
          >
            {secondText}
          </span>
        )
      case 'text':
      default:
        return (
          <span style={{ color: secondColor }} className="inline-block ml-1.5 font-black">
            {secondText}
          </span>
        )
    }
  }

  const HeadingTag = level

  const sizeClass =
    level === 'h1'
      ? 'text-3xl sm:text-5xl md:text-6xl font-black'
      : level === 'h2'
      ? 'text-2xl sm:text-4xl md:text-5xl font-extrabold'
      : 'text-xl sm:text-2xl md:text-3xl font-bold'

  return (
    <div className={`w-full my-5 max-w-4xl mx-auto ${alignClass}`}>
      {subtitle && (
        <div
          style={{ color: secondColor }}
          className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-2"
        >
          {subtitle}
        </div>
      )}
      <HeadingTag className={`${sizeClass} tracking-tight leading-tight`}>
        <span style={{ color: firstColor }}>{firstText}</span>
        {renderSecondText()}
      </HeadingTag>
    </div>
  )
}
