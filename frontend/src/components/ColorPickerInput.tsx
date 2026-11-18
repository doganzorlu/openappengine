import React, { useState } from 'react'

interface ColorPickerInputProps {
  label?: string
  value?: string | null
  onChange: (color: string) => void
  allowTransparent?: boolean
  inheritedColor?: string
  inheritedLabel?: string
}

// Quick pick row (most commonly used web/brand colors)
const QUICK_SWATCHES = [
  { name: 'Beyaz', hex: '#FFFFFF', border: true },
  { name: 'Açık Gri', hex: '#F3F4F6' },
  { name: 'Siyah', hex: '#111827' },
  { name: 'Derin Lacivert', hex: '#023E8A' },
  { name: 'Açık Mavi', hex: '#4DA8DA' },
  { name: 'İndigo / Mor', hex: '#4F46E5' },
  { name: 'Zümrüt Yeşil', hex: '#059669' },
  { name: 'Amber / Sarı', hex: '#FFB92C' },
  { name: 'Kırmızı', hex: '#EF4444' },
]

// Extended palette
const EXTENDED_PALETTE = [
  // Grays
  { name: 'Beyaz', hex: '#FFFFFF', border: true },
  { name: 'Açık Gri', hex: '#F3F4F6' },
  { name: 'Gümüş', hex: '#E5E7EB' },
  { name: 'Nötr Gri', hex: '#9CA3AF' },
  { name: 'Koyu Gri', hex: '#374151' },
  { name: 'Siyah', hex: '#111827' },

  // Purples & Blues
  { name: 'İndigo', hex: '#4F46E5' },
  { name: 'Mor', hex: '#7C3AED' },
  { name: 'Fuşya', hex: '#9333EA' },
  { name: 'Bebek Mavisi', hex: '#BAE6FD' },
  { name: 'Açık Mavi', hex: '#4DA8DA' },
  { name: 'Okyanus Mavi', hex: '#0284C7' },
  { name: 'Derin Lacivert', hex: '#023E8A' },
  { name: 'Gece Mavisi', hex: '#0F172A' },

  // Greens & Cyans
  { name: 'Zümrüt Yeşil', hex: '#059669' },
  { name: 'Canlı Yeşil', hex: '#10B981' },
  { name: 'Nane Yeşili', hex: '#A7F3D0' },
  { name: 'Camgöbeği', hex: '#06B6D4' },
  { name: 'Turkuaz', hex: '#14B8A6' },

  // Warm colors
  { name: 'Sarı / Amber', hex: '#FFB92C' },
  { name: 'Altın Sarısı', hex: '#F59E0B' },
  { name: 'Turuncu', hex: '#EA580C' },
  { name: 'Mercan Kırmızı', hex: '#F97316' },
  { name: 'Canlı Kırmızı', hex: '#EF4444' },
  { name: 'Gül Pembesi', hex: '#F43F5E' },
  { name: 'Canlı Pembe', hex: '#EC4899' },
]

export const ColorPickerInput: React.FC<ColorPickerInputProps> = ({
  label,
  value = '',
  onChange,
  allowTransparent = true,
  inheritedColor,
  inheritedLabel = 'Tema / Miras',
}) => {
  const [showFullPalette, setShowFullPalette] = useState(false)
  const currentColor = value || ''
  const isTransparent = currentColor === 'transparent' || currentColor === ''

  return (
    <div className="space-y-1.5 text-xs">
      {label && <label className="block font-semibold text-gray-700">{label}</label>}

      {/* Main Bar: Swatch Preview, Text, HTML5 color input, Clear */}
      <div className="flex items-center gap-1.5">
        <div className="h-9 px-2 rounded-xl border border-gray-200 bg-white flex items-center gap-2 flex-1 shadow-2xs">
          {/* Swatch color bubble */}
          <span
            className="w-5 h-5 rounded-lg border border-black/10 shrink-0 shadow-inner relative overflow-hidden"
            style={{
              backgroundColor: isTransparent ? '#ffffff' : currentColor,
            }}
          >
            {isTransparent && (
              <span className="absolute inset-0 bg-gradient-to-tr from-red-500/20 via-transparent to-red-500/20 border-b border-red-500 rotate-45" />
            )}
          </span>

          <div className="flex-1 flex items-center justify-between min-w-0 pr-1">
            <span className="font-mono text-gray-700 truncate font-semibold text-[11px]">
              {isTransparent
                ? 'Şeffaf / Yok'
                : currentColor || (inheritedColor ? `${inheritedLabel}: ${inheritedColor}` : 'Varsayılan')}
            </span>
            {currentColor && currentColor !== 'transparent' && inheritedColor && (
              <button
                type="button"
                onClick={() => onChange('')}
                title="Özel Rengi Kaldır (Temadan Miras Al)"
                className="text-[10px] text-purple-600 hover:text-purple-800 font-bold hover:underline shrink-0 ml-1"
              >
                ↺ Miras Al
              </button>
            )}
          </div>
        </div>

        {/* HTML5 Native Color Picker Wheel */}
        <div className="relative shrink-0" title="Özel Renk Seç (Renk Çarkı)">
          <input
            type="color"
            value={isTransparent ? '#ffffff' : currentColor.startsWith('#') ? currentColor.slice(0, 7) : '#4F46E5'}
            onChange={(e) => onChange(e.target.value)}
            className="w-9 h-9 p-0.5 rounded-xl border border-gray-200 bg-white cursor-pointer shadow-2xs hover:scale-105 transition"
          />
        </div>

        {/* Clear / Transparent Button */}
        {allowTransparent && (
          <button
            type="button"
            onClick={() => onChange('transparent')}
            title="Şeffaf Yap / Temizle"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition shrink-0 text-xs font-bold shadow-2xs ${
              isTransparent
                ? 'bg-purple-100 border-purple-300 text-purple-700'
                : 'border-gray-200 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            ∅
          </button>
        )}
      </div>

      {/* Quick Pick Swatches Row (Always visible for 1-click styling) */}
      <div className="flex items-center justify-between gap-1 py-1">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {QUICK_SWATCHES.map((c) => {
            const isSelected = currentColor.toLowerCase() === c.hex.toLowerCase()
            return (
              <button
                key={c.hex}
                type="button"
                title={`${c.name} (${c.hex})`}
                onClick={() => onChange(c.hex)}
                className={`w-5 h-5 rounded-full transition-transform shrink-0 flex items-center justify-center shadow-2xs hover:scale-125 ${
                  c.border ? 'border border-gray-300' : 'border border-black/10'
                } ${isSelected ? 'ring-2 ring-purple-600 scale-110' : ''}`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && (
                  <span
                    className={`text-[8px] font-black ${
                      c.hex === '#FFFFFF' || c.hex === '#F3F4F6' || c.hex === '#FFB92C'
                        ? 'text-gray-900'
                        : 'text-white'
                    }`}
                  >
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowFullPalette(!showFullPalette)}
          className="text-[10px] font-bold text-purple-600 hover:text-purple-800 shrink-0 ml-1 hover:underline"
        >
          {showFullPalette ? 'Gizle' : 'Tümü ▾'}
        </button>
      </div>

      {/* Extended Grid Palette Drawer */}
      {showFullPalette && (
        <div className="p-2.5 bg-slate-50 border border-gray-200 rounded-xl space-y-2 shadow-xs animate-fade-in">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Geniş Renk Paleti
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {EXTENDED_PALETTE.map((c) => {
              const isSelected = currentColor.toLowerCase() === c.hex.toLowerCase()
              return (
                <button
                  key={c.hex}
                  type="button"
                  title={`${c.name} (${c.hex})`}
                  onClick={() => onChange(c.hex)}
                  className={`w-6 h-6 rounded-lg transition-transform flex items-center justify-center shadow-2xs hover:scale-120 ${
                    c.border ? 'border border-gray-300' : 'border border-black/10'
                  } ${isSelected ? 'ring-2 ring-purple-600 scale-110' : ''}`}
                  style={{ backgroundColor: c.hex }}
                >
                  {isSelected && (
                    <span
                      className={`text-[9px] font-black ${
                        c.hex === '#FFFFFF' || c.hex === '#F3F4F6' || c.hex === '#FFB92C' || c.hex === '#BAE6FD' || c.hex === '#A7F3D0'
                          ? 'text-gray-900'
                          : 'text-white'
                      }`}
                    >
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Hex Input */}
          <div className="pt-1.5 border-t border-gray-200 flex items-center gap-1.5">
            <span className="text-gray-400 font-mono text-xs">#</span>
            <input
              type="text"
              placeholder="Hex kodu"
              value={currentColor.replace(/^#/, '')}
              onChange={(e) => {
                const val = e.target.value.trim()
                onChange(val ? `#${val.replace(/^#/, '')}` : '')
              }}
              className="flex-1 px-2 py-0.5 text-xs bg-white border border-gray-200 rounded-md font-mono outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}
