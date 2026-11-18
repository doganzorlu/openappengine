import React from 'react'

interface ProgressBarProps {
  label?: string
  percentage: number
  valueText?: string
  barColor?: string
  trackBg?: string
  height?: number
  showStripes?: boolean
  textColor?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  percentage = 75,
  valueText,
  barColor = '#10B981',
  trackBg = '#E2E8F0',
  height = 16,
  showStripes = true,
  textColor = '#1E293B',
}) => {
  const clamped = Math.min(100, Math.max(0, percentage))

  return (
    <div className="w-full my-4 max-w-2xl mx-auto">
      {/* Header Info */}
      {(label || valueText) && (
        <div className="flex items-center justify-between gap-4 mb-2">
          {label && (
            <span
              style={{ color: textColor }}
              className="text-xs sm:text-sm font-bold truncate"
            >
              {label}
            </span>
          )}
          <span
            style={{ color: barColor }}
            className="text-xs sm:text-sm font-extrabold shrink-0"
          >
            {valueText || `%${clamped}`}
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div
        style={{
          backgroundColor: trackBg,
          height: `${height}px`,
        }}
        className="w-full rounded-full overflow-hidden shadow-inner relative"
      >
        {/* Animated Progress Fill */}
        <div
          style={{
            width: `${clamped}%`,
            backgroundColor: barColor,
          }}
          className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
            showStripes
              ? 'bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:24px_24px] animate-pulse'
              : ''
          }`}
        />
      </div>
    </div>
  )
}
