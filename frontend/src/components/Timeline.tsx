import React from 'react'

interface TimelineItem {
  id: string
  year: string
  date: string
  title: string
  description: string
  icon?: string
  image?: string
}

interface TimelineProps {
  items: TimelineItem[]
  accentColor?: string
}

export const Timeline: React.FC<TimelineProps> = ({ items, accentColor = '#BB0096' }) => {
  if (!items || items.length === 0) return null

  return (
    <div className="relative border-l-2 ml-4 md:ml-32 my-8 space-y-10" style={{ borderColor: accentColor }}>
      {items.map((item, index) => (
        <div key={item.id || index} className="relative pl-6 md:pl-8 group">
          {/* Dot / Badge */}
          <div
            className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shadow-md transition-transform group-hover:scale-110"
            style={{ backgroundColor: accentColor }}
          >
            🎵
          </div>

          {/* Year & Date (desktop left badge) */}
          <div className="md:absolute md:-left-32 md:top-2 md:w-24 md:text-right text-sm font-bold text-gray-500">
            {item.year && <span className="block text-base font-extrabold" style={{ color: accentColor }}>{item.year}</span>}
            {item.date && <span className="block text-xs">{item.date}</span>}
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h4 className="text-lg font-bold mb-1" style={{ color: accentColor }}>{item.title}</h4>
            <div
              className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none"
              style={{ fontFamily: 'Roboto, sans-serif' }}
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
