import React, { useState } from 'react'

interface AccordionItem {
  id: string
  title: string
  content: string
}

interface AccordionProps {
  items: AccordionItem[]
}

export const Accordion: React.FC<AccordionProps> = ({ items = [] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (!items || items.length === 0) return null

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <div className="w-full space-y-3 my-6">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx
        return (
          <div
            key={item.id || idx}
            className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-800 hover:text-purple-700 bg-gray-50/50 hover:bg-gray-50 transition"
            >
              <span className="text-base sm:text-lg">{item.title}</span>
              <span
                className={`transform transition-transform duration-200 text-purple-600 font-bold text-xl ${
                  isOpen ? 'rotate-180' : ''
                }`}
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div
                className="p-5 text-gray-600 leading-relaxed border-t border-gray-100 prose max-w-none text-sm sm:text-base bg-white"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
