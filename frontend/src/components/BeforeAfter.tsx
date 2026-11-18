import React, { useState, useRef, useCallback } from 'react'

interface BeforeAfterProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  defaultPosition?: number
  accentColor?: string
  height?: number
}

export const BeforeAfter: React.FC<BeforeAfterProps> = ({
  beforeImage = '/storage/sites/berilzorlu/media/2016/05/beril-afis-4-150x150.jpg',
  afterImage = '/storage/sites/berilzorlu/media/2016/05/beril-afis-4-150x150.jpg',
  beforeLabel = 'Öncesi',
  afterLabel = 'Sonrası',
  defaultPosition = 50,
  accentColor = '#FFB92C',
  height = 420,
}) => {
  const [sliderPosition, setSliderPosition] = useState(defaultPosition)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percent)
  }, [])

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    handleMove(e.touches[0].clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }

  return (
    <div className="w-full my-6 max-w-4xl mx-auto select-none">
      <div
        ref={containerRef}
        style={{ height: `${height}px` }}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200/80 cursor-ew-resize group bg-slate-900"
      >
        {/* After Image (Background / Full) */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* After Label Badge */}
        {afterLabel && (
          <span className="absolute bottom-4 right-4 z-10 bg-black/60 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-md">
            {afterLabel}
          </span>
        )}

        {/* Before Image (Clipped Left Layer) */}
        <div
          style={{ width: `${sliderPosition}%` }}
          className="absolute inset-0 h-full overflow-hidden z-20 pointer-events-none"
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              height: `${height}px`,
              maxWidth: 'none',
            }}
            className="object-cover h-full"
          />

          {/* Before Label Badge */}
          {beforeLabel && (
            <span className="absolute bottom-4 left-4 z-30 bg-black/60 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-md">
              {beforeLabel}
            </span>
          )}
        </div>

        {/* Vertical Divider Line */}
        <div
          style={{ left: `${sliderPosition}%` }}
          className="absolute top-0 bottom-0 w-1 bg-white z-30 pointer-events-none -translate-x-1/2 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        >
          {/* Circular Drag Handle */}
          <div
            style={{ borderColor: accentColor }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-2xl border-4 flex items-center justify-center text-xs font-bold text-gray-800 transition-transform group-hover:scale-110"
          >
            ↔
          </div>
        </div>
      </div>
    </div>
  )
}
