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
  iconColor = '#7C3AED',
  textColor,
}) => {
  if (!items || items.length === 0) return null

  return (
    <ul className="space-y-3 my-4">
      {items.map((item, idx) => {
        const content = (
          <li
            key={item.id || idx}
            className="flex items-center gap-3 text-sm sm:text-base text-gray-700 hover:text-gray-900 transition"
            style={textColor ? { color: textColor } : {}}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 bg-purple-50"
              style={{ color: iconColor }}
            >
              {item.icon ? <i className={item.icon} /> : '✓'}
            </span>
            <span>{item.text}</span>
          </li>
        )

        if (item.url) {
          return (
            <a
              key={item.id || idx}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block hover:opacity-80 transition"
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
