import React, { useState } from 'react'
import { normalizeMediaUrl } from './ImageBox'

interface AccordionItem {
  id: string
  title: string
  content: string
  bgImage: string
}

interface ImageAccordionProps {
  items: AccordionItem[]
  height?: number
  siteSlug?: string
}

export const ImageAccordion: React.FC<ImageAccordionProps> = ({
  items,
  height = 380,
  siteSlug = 'otizmkonfederasyonu',
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0)

  if (!items || items.length === 0) return null

  return (
    <div
      className="flex flex-col md:flex-row gap-3 w-full rounded-2xl overflow-hidden my-6 shadow-lg bg-gray-900 p-2"
      style={{ minHeight: `${height}px` }}
    >
      {items.map((item, index) => {
        const isActive = activeIndex === index
        return (
          <div
            key={item.id || index}
            onClick={() => setActiveIndex(index)}
            className={`relative cursor-pointer transition-all duration-500 ease-out rounded-xl overflow-hidden flex flex-col justify-end p-6 ${
              isActive ? 'md:flex-[3] flex-[2]' : 'md:flex-1 flex-1 opacity-75 hover:opacity-100'
            }`}
            style={{
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%), url('${normalizeMediaUrl(item.bgImage, siteSlug)}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="z-10 text-white">
              <h4 className="text-xl font-bold tracking-wide">{item.title}</h4>
              {isActive && (
                <div
                  className="mt-2 text-sm text-gray-200 leading-relaxed transition-opacity duration-300"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
