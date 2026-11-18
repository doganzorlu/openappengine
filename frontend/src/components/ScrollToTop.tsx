import React, { useState, useEffect } from 'react'

interface ScrollToTopProps {
  threshold?: number
  accentColor?: string
  bgColor?: string
  position?: 'bottom-right' | 'bottom-left'
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 300,
  accentColor = '#FFFFFF',
  bgColor = '#0F172A',
  position = 'bottom-right',
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', checkScroll, { passive: true })
    checkScroll()

    return () => window.removeEventListener('scroll', checkScroll)
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) return null

  const posClass = position === 'bottom-left' ? 'left-6 bottom-24' : 'right-6 bottom-24'

  return (
    <button
      type="button"
      onClick={scrollToTop}
      style={{ backgroundColor: bgColor, color: accentColor }}
      className={`fixed ${posClass} z-40 w-11 h-11 rounded-full shadow-2xl flex items-center justify-center font-bold text-lg hover:scale-110 hover:-translate-y-1 transition-all duration-300 border border-white/20 cursor-pointer animate-fadeIn`}
      title="Başa Dön"
    >
      ↑
    </button>
  )
}
