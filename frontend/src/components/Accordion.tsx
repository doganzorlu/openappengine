import React, { useState } from 'react'

export interface AccordionItem {
  id?: string
  title: string
  content: string
}

interface AccordionProps {
  items: AccordionItem[]
  allowMultiple?: boolean
  accentColor?: string
  cardBg?: string
  titleColor?: string
}

export const Accordion: React.FC<AccordionProps> = ({
  items = [],
  allowMultiple = false,
  accentColor = '#4F46E5',
  cardBg = '#FFFFFF',
  titleColor = '#1F2937',
}) => {
  const [openIndices, setOpenIndices] = useState<number[]>([0])

  if (!items || items.length === 0) return null

  const toggle = (idx: number) => {
    if (allowMultiple) {
      if (openIndices.includes(idx)) {
        setOpenIndices(openIndices.filter((i) => i !== idx))
      } else {
        setOpenIndices([...openIndices, idx])
      }
    } else {
      setOpenIndices(openIndices.includes(idx) ? [] : [idx])
    }
  }

  return (
    <div className="w-full space-y-3.5 my-6 max-w-4xl mx-auto">
      {items.map((item, idx) => {
        const isOpen = openIndices.includes(idx)
        return (
          <div
            key={item.id || idx}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
              isOpen
                ? 'border-l-4 shadow-sm'
                : 'border-gray-200/90'
            }`}
            style={{
              backgroundColor: cardBg,
              borderLeftColor: isOpen ? accentColor : undefined,
              borderColor: isOpen ? undefined : '#E5E7EB',
            }}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between p-5 text-left font-semibold hover:bg-gray-50/70 transition-colors"
            >
              <span
                style={{ color: isOpen ? accentColor : titleColor }}
                className="text-base sm:text-lg font-bold pr-4 transition-colors"
              >
                {item.title}
              </span>
              <div
                style={{
                  backgroundColor: isOpen ? `${accentColor}1A` : '#F3F4F6',
                  color: isOpen ? accentColor : '#6B7280',
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-transform duration-200"
              >
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>
            </button>
            {isOpen && (
              <div
                className="px-5 pb-5 pt-1 text-gray-600 leading-relaxed border-t border-gray-100 text-sm sm:text-base prose max-w-none"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
