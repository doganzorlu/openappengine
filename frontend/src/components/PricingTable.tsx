import React from 'react'

export interface PricingFeature {
  text: string
  included?: boolean
}

interface PricingTableProps {
  title: string
  price: string
  period?: string
  description?: string
  badge?: string
  isFeatured?: boolean
  features?: PricingFeature[]
  buttonText?: string
  buttonUrl?: string
  accentColor?: string
  cardBg?: string
}

export const PricingTable: React.FC<PricingTableProps> = ({
  title,
  price,
  period = '',
  description,
  badge,
  isFeatured = false,
  features = [],
  buttonText = 'Hemen Destek Ol',
  buttonUrl = '#',
  accentColor = '#4F46E5',
  cardBg = '#FFFFFF',
}) => {
  return (
    <div
      className={`relative rounded-3xl transition-all duration-300 flex flex-col justify-between overflow-hidden w-full max-w-sm mx-auto my-3 ${
        isFeatured
          ? 'border-2 shadow-2xl -translate-y-2'
          : 'border border-gray-200/80 shadow-md hover:shadow-xl hover:-translate-y-1'
      }`}
      style={{
        backgroundColor: cardBg,
        borderColor: isFeatured ? accentColor : undefined,
      }}
    >
      {/* Featured Ribbon / Badge */}
      {badge && (
        <div className="absolute top-0 right-0">
          <div
            style={{ backgroundColor: accentColor }}
            className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-md"
          >
            {badge}
          </div>
        </div>
      )}

      {/* Card Header */}
      <div className="p-6 sm:p-8 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-xs sm:text-sm text-gray-500 min-h-[36px] line-clamp-2">
            {description}
          </p>
        )}

        <div className="mt-5 flex items-baseline gap-1.5">
          <span
            style={{ color: accentColor }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
          >
            {price}
          </span>
          {period && (
            <span className="text-sm font-medium text-gray-500">
              {period}
            </span>
          )}
        </div>
      </div>

      {/* Features List */}
      <div className="p-6 sm:p-8 flex-1">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
          Paket İçeriği
        </div>
        <ul className="space-y-3">
          {features.map((feature, idx) => {
            const isIncluded = feature.included !== false
            return (
              <li
                key={idx}
                className={`flex items-start gap-2.5 text-xs sm:text-sm ${
                  isIncluded ? 'text-gray-700' : 'text-gray-400 line-through'
                }`}
              >
                <span
                  style={{ color: isIncluded ? accentColor : '#9CA3AF' }}
                  className="font-bold text-sm shrink-0 mt-0.5"
                >
                  {isIncluded ? '✓' : '✕'}
                </span>
                <span>{feature.text}</span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Card Action Button */}
      <div className="p-6 sm:p-8 pt-0">
        <a
          href={buttonUrl}
          style={{
            backgroundColor: isFeatured ? accentColor : undefined,
            borderColor: isFeatured ? accentColor : '#E5E7EB',
            color: isFeatured ? '#FFFFFF' : '#374151',
          }}
          className={`w-full py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 border shadow-sm ${
            isFeatured
              ? 'hover:brightness-110 shadow-indigo-100'
              : 'hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          <span>{buttonText}</span>
          <span className="text-base font-normal">→</span>
        </a>
      </div>
    </div>
  )
}
