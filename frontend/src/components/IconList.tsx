import React from 'react'

interface IconListItem {
  id: string
  text: string
  icon?: string
  url?: string | null
}

interface IconListProps {
  items: IconListItem[]
  iconColor?: string
  textColor?: string
}

export const IconList: React.FC<IconListProps> = ({
  items = [],
  iconColor,
  textColor,
}) => {
  if (!items || items.length === 0) return null

  const renderIcon = (iconStr?: string) => {
    const s = (iconStr || '').toLowerCase()
    if (s.includes('envelope') || s.includes('mail')) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      )
    }
    if (s.includes('globe') || s.includes('web')) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      )
    }
    if (s.includes('phone')) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
        </svg>
      )
    }
    if (iconStr) {
      return <i className={iconStr} />
    }
    return <span>✓</span>
  }

  const isLightText = textColor === '#F8F9FA' || textColor === '#FFFFFF' || textColor === '#E0E0E0'
  const effectiveIconColor = iconColor || (isLightText ? '#FFFFFF' : '#0077B6')

  return (
    <ul className="space-y-2.5 my-3 flex flex-col items-center">
      {items.map((item, idx) => {
        const content = (
          <li
            key={item.id || idx}
            className={`flex items-center gap-2.5 text-xs sm:text-sm font-medium transition ${
              isLightText ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
            style={textColor ? { color: textColor } : {}}
          >
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                isLightText ? 'bg-white/10 text-white' : 'bg-blue-50 text-[#0077B6]'
              }`}
              style={{ color: effectiveIconColor }}
            >
              {renderIcon(item.icon)}
            </span>
            <span className="break-all">{item.text}</span>
          </li>
        )

        if (item.url) {
          const finalUrl = item.url.startsWith('http') || item.url.startsWith('mailto:') ? item.url : `https://${item.url}`
          return (
            <a
              key={item.id || idx}
              href={finalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block hover:opacity-85 transition"
            >
              {content}
            </a>
          )
        }

        return content
      })}
    </ul>
  )
}
