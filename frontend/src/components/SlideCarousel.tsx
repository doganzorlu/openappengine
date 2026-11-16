import React, { useState } from 'react'
import type { ComponentNode } from '../types'
import { ComponentRenderer } from './ComponentRenderer'

interface SlideCarouselProps {
  slides: ComponentNode[]
  siteSlug: string
  slidesToShow?: number
  isEditing?: boolean
  selectedNodeId?: string | null
  onSelectNode?: (node: ComponentNode) => void
}

export const SlideCarousel: React.FC<SlideCarouselProps> = ({
  slides = [],
  siteSlug,
  slidesToShow = 3,
  isEditing,
  selectedNodeId,
  onSelectNode,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!slides || slides.length === 0) return null

  const maxIndex = Math.max(0, slides.length - slidesToShow)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  return (
    <div className="relative w-full my-8 group">
      <div className="overflow-hidden p-2">
        <div
          className="flex transition-transform duration-500 ease-out gap-6"
          style={{
            transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
          }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex-shrink-0"
              style={{ width: `calc(${100 / slidesToShow}% - 1rem)` }}
            >
              <ComponentRenderer
                nodes={[slide]}
                siteSlug={siteSlug}
                isEditing={isEditing}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
              />
            </div>
          ))}
        </div>
      </div>

      {slides.length > slidesToShow && (
        <>
          <button
            onClick={handlePrev}
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl text-gray-800 flex items-center justify-center hover:scale-110 transition border border-gray-100 z-10"
            aria-label="Önceki Slayt"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl text-gray-800 flex items-center justify-center hover:scale-110 transition border border-gray-100 z-10"
            aria-label="Sonraki Slayt"
          >
            →
          </button>
        </>
      )}
    </div>
  )
}
