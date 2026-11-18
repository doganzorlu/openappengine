import React from 'react'

export interface PriceMenuItem {
  title: string
  price: string
  description?: string
  badge?: string
}

interface PriceMenuProps {
  title?: string
  subtitle?: string
  items?: PriceMenuItem[]
  accentColor?: string
  cardBg?: string
}

export const PriceMenu: React.FC<PriceMenuProps> = ({
  title = 'Eğitim & Atölye Katkı Payları',
  subtitle = 'Tüm katkı payları öğrencilerin enstrüman ve materyal giderlerini karşılamaktadır.',
  items = [
    {
      title: 'Bireysel Piyano Terapisi Seansı',
      price: '750 ₺',
      description: 'Uzman eğitmen eşliğinde haftalık 50 dakika birebir çalgı eğitimi.',
      badge: 'En Popüler',
    },
    {
      title: 'Grup Orff & Ritim Çemberi',
      price: '450 ₺',
      description: 'Vurmalı çalgılar ile sosyal uyum ve akran etkileşimi atölyesi.',
    },
    {
      title: 'Koro & Şan Eğitimi',
      price: '500 ₺',
      description: 'Doğru nefes alma ve ses artikülasyonu grup çalışması.',
    },
    {
      title: 'Veli Danışmanlığı & Deneyim Paylaşımı',
      price: 'Ücretsiz',
      description: 'Alanında uzman akademisyenlerle rehberlik buluşmaları.',
      badge: 'Destek',
    },
  ],
  accentColor = '#023E8A',
  cardBg = '#FFFFFF',
}) => {
  return (
    <div
      style={{ backgroundColor: cardBg }}
      className="w-full my-6 max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl"
    >
      {title && (
        <div className="text-center mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="space-y-6">
        {items.map((item, idx) => (
          <div key={idx} className="group">
            {/* Header with Title, Dotted Line, and Price */}
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-sm sm:text-base text-gray-900 shrink-0">
                {item.title}
              </span>
              {item.badge && (
                <span
                  style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                >
                  {item.badge}
                </span>
              )}
              {/* Dotted Leader */}
              <div className="flex-1 border-b-2 border-dotted border-gray-300 mx-1 relative top-[-3px]" />
              <span
                style={{ color: accentColor }}
                className="font-extrabold text-sm sm:text-base shrink-0 group-hover:scale-105 transition-transform"
              >
                {item.price}
              </span>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-xs text-gray-500 mt-1 pl-1">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
