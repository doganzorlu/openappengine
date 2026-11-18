import React, { useState } from 'react'

export interface HotspotItem {
  id?: string
  x: number // percentage 0 - 100
  y: number // percentage 0 - 100
  title: string
  description: string
  link?: string
}

interface ImageHotspotsProps {
  imageUrl?: string
  hotspots?: HotspotItem[]
  accentColor?: string
  height?: number
}

export const ImageHotspots: React.FC<ImageHotspotsProps> = ({
  imageUrl = '/storage/sites/otizmuzikokulu/media/2026/11/WhatsApp-Image-2026-11-15-at-19.48.10-1-1024x684.jpg',
  hotspots = [
    {
      id: 'h1',
      x: 35,
      y: 40,
      title: 'Bireysel Piyano Eğitmeni',
      description: 'Konservatuvar mezunu alanında uzman akademisyen eğitmen kadromuz.',
    },
    {
      id: 'h2',
      x: 65,
      y: 60,
      title: 'Özel Çalgı Seti',
      description: 'Farklı öğrenen öğrencilerin dokunsal hassasiyetine uygun tuş takımı.',
    },
  ],
  accentColor = '#FFB92C',
  height = 460,
}) => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)

  return (
    <div className="w-full my-6 max-w-4xl mx-auto">
      <div
        style={{ height: `${height}px` }}
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200/80 bg-slate-900 select-none"
      >
        {/* Background Image */}
        <img
          src={imageUrl}
          alt="Etkileşimli Görsel"
          className="w-full h-full object-cover"
        />

        {/* Hotspot Pins */}
        {hotspots.map((spot, idx) => {
          const spotId = spot.id || `spot_${idx}`
          const isActive = activeHotspot === spotId

          return (
            <div
              key={spotId}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              onMouseEnter={() => setActiveHotspot(spotId)}
              onMouseLeave={() => setActiveHotspot(null)}
              onClick={() => setActiveHotspot(isActive ? null : spotId)}
            >
              {/* Pulse Ring */}
              <span
                style={{ backgroundColor: accentColor }}
                className="absolute -inset-2 rounded-full animate-ping opacity-40 pointer-events-none"
              />

              {/* Pin Icon */}
              <button
                type="button"
                style={{ backgroundColor: accentColor, color: '#0F172A' }}
                className="relative w-8 h-8 rounded-full shadow-xl flex items-center justify-center font-black text-sm hover:scale-125 transition-transform duration-200 cursor-pointer border-2 border-white"
              >
                {isActive ? '✕' : '+'}
              </button>

              {/* Tooltip Card */}
              {isActive && (
                <div
                  className="absolute bottom-11 left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md z-30 animate-fadeIn"
                >
                  <h4 className="font-bold text-sm mb-1 leading-snug" style={{ color: accentColor }}>
                    {spot.title}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {spot.description}
                  </p>
                  {spot.link && (
                    <a
                      href={spot.link}
                      className="text-[11px] font-bold text-amber-300 underline mt-2 block"
                    >
                      Daha Fazla Bilgi →
                    </a>
                  )}
                  {/* Tooltip Arrow */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-900/95" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
