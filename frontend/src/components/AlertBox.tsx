import React, { useState } from 'react'

interface AlertBoxProps {
  type?: 'info' | 'success' | 'warning' | 'urgent'
  title?: string
  message: string
  dismissible?: boolean
  actionText?: string
  actionUrl?: string
}

export const AlertBox: React.FC<AlertBoxProps> = ({
  type = 'info',
  title,
  message,
  dismissible = true,
  actionText,
  actionUrl,
}) => {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50/90',
          border: 'border-emerald-200',
          text: 'text-emerald-950',
          titleText: 'text-emerald-900',
          iconColor: 'text-emerald-600',
          icon: '✓',
          badgeBg: 'bg-emerald-600',
        }
      case 'warning':
        return {
          bg: 'bg-amber-50/90',
          border: 'border-amber-200',
          text: 'text-amber-950',
          titleText: 'text-amber-900',
          iconColor: 'text-amber-600',
          icon: '⚠️',
          badgeBg: 'bg-amber-600',
        }
      case 'urgent':
        return {
          bg: 'bg-rose-50/90',
          border: 'border-rose-200',
          text: 'text-rose-950',
          titleText: 'text-rose-900',
          iconColor: 'text-rose-600',
          icon: '🔔',
          badgeBg: 'bg-rose-600',
        }
      case 'info':
      default:
        return {
          bg: 'bg-blue-50/90',
          border: 'border-blue-200',
          text: 'text-blue-950',
          titleText: 'text-blue-900',
          iconColor: 'text-blue-600',
          icon: 'ℹ️',
          badgeBg: 'bg-blue-600',
        }
    }
  }

  const theme = getTheme()

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 my-4 shadow-xs relative transition-all duration-300 max-w-4xl mx-auto ${theme.bg} ${theme.border}`}
    >
      <div className="flex items-start gap-3.5">
        {/* Icon */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 shadow-xs bg-white/80 ${theme.iconColor}`}
        >
          {theme.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          {title && (
            <h4 className={`text-sm sm:text-base font-bold mb-1 ${theme.titleText}`}>
              {title}
            </h4>
          )}
          <p className={`text-xs sm:text-sm leading-relaxed ${theme.text}`}>
            {message}
          </p>

          {actionText && (
            <div className="mt-2.5">
              <a
                href={actionUrl || '#'}
                className="text-xs font-bold underline hover:opacity-80 inline-flex items-center gap-1"
              >
                <span>{actionText}</span>
                <span>→</span>
              </a>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg text-sm shrink-0 transition cursor-pointer"
            title="Kapat"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
