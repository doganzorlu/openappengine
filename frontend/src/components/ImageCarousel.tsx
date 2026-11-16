import React, { useState, useEffect } from 'react'

interface CarouselImage {
  id?: string | number
  url: string
}

interface ImageCarouselProps {
  images: CarouselImage[]
  slidesToShow?: number
  autoplay?: boolean
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images = [],
  slidesToShow = 4,
  autoplay = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) return null

  const maxIndex = Math.max(0, images.length - slidesToShow)

  useEffect(() => {
    if (!autoplay || maxIndex === 0) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
    }, 3500)
    return () => clearInterval(timer)
  }, [autoplay, maxIndex])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  return (
    <div className="relative w-full my-8 group">
      {/* Slider Window */}
      <div className="overflow-hidden rounded-2xl shadow-xl bg-gray-50 p-4 border border-gray-100">
        <div
          className="flex transition-transform duration-500 ease-out gap-4"
          style={{
            transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
          }}
        >
          {images.map((img, idx) => (
            <div
              key={img.id || idx}
              className="flex-shrink-0 flex items-center justify-center p-2 rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden"
              style={{ width: `calc(${100 / slidesToShow}% - 1rem)` }}
            >
              <img
                src={img.url}
                alt={`Carousel ${idx + 1}`}
                className="max-h-28 object-contain hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {images.length > slidesToShow && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg text-gray-800 flex items-center justify-center hover:bg-white hover:scale-110 transition opacity-0 group-hover:opacity-100"
            aria-label="Önceki"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg text-gray-800 flex items-center justify-center hover:bg-white hover:scale-110 transition opacity-0 group-hover:opacity-100"
            aria-label="Sonraki"
          >
            →
          </button>
        </>
      )}
    </div>
  )
}
