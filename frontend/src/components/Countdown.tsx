import React, { useState, useEffect } from 'react'

interface CountdownProps {
  targetDate?: string
  title?: string
  completedText?: string
  accentColor?: string
  boxBg?: string
  textColor?: string
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isCompleted: boolean
}

function calculateTimeRemaining(targetStr?: string): TimeRemaining {
  let targetTime: number
  if (!targetStr) {
    // Default to 45 days in future if unspecified
    targetTime = Date.now() + 45 * 24 * 60 * 60 * 1000
  } else {
    targetTime = new Date(targetStr).getTime()
    if (isNaN(targetTime)) {
      targetTime = Date.now() + 45 * 24 * 60 * 60 * 1000
    }
  }

  const now = Date.now()
  const diff = targetTime - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / 1000 / 60) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds, isCompleted: false }
}

export const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  title,
  completedText = 'Etkinlik Başladı!',
  accentColor = '#4F46E5',
  boxBg = '#1E293B',
  textColor = '#FFFFFF',
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => calculateTimeRemaining(targetDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(targetDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const timeUnits = [
    { label: 'GÜN', value: timeLeft.days },
    { label: 'SAAT', value: timeLeft.hours },
    { label: 'DAKİKA', value: timeLeft.minutes },
    { label: 'SANİYE', value: timeLeft.seconds },
  ]

  if (timeLeft.isCompleted) {
    return (
      <div className="w-full my-6 text-center py-8 px-6 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-md">
        <span className="text-4xl mb-2 block">🎉</span>
        <h3 className="text-xl sm:text-2xl font-black text-emerald-800">{completedText}</h3>
      </div>
    )
  }

  return (
    <div className="w-full my-6 flex flex-col items-center">
      {title && (
        <h3
          style={{ color: textColor }}
          className="text-base sm:text-xl font-extrabold uppercase tracking-widest mb-6 text-center"
        >
          {title}
        </h3>
      )}

      <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-2xl w-full">
        {timeUnits.map((u, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: boxBg,
              borderColor: `${accentColor}33`,
            }}
            className="flex flex-col items-center justify-center py-4 sm:py-6 px-2 sm:px-4 rounded-2xl sm:rounded-3xl shadow-xl border backdrop-blur-md transition-all hover:scale-105 group"
          >
            <span
              style={{ color: textColor }}
              className="text-2xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight leading-none group-hover:drop-shadow-lg"
            >
              {String(u.value).padStart(2, '0')}
            </span>
            <span
              style={{ color: accentColor }}
              className="text-[9px] sm:text-xs font-bold uppercase tracking-wider mt-2 sm:mt-3"
            >
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
