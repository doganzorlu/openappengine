import React, { useEffect, useState } from 'react'

interface CounterProps {
  endingNumber: number
  startingNumber?: number
  prefix?: string
  suffix?: string
  title?: string
  styles?: React.CSSProperties
}

export const Counter: React.FC<CounterProps> = ({
  endingNumber,
  startingNumber = 0,
  prefix = '',
  suffix = '',
  title = '',
  styles = {},
}) => {
  const [count, setCount] = useState(startingNumber)

  useEffect(() => {
    let start = startingNumber
    const end = endingNumber
    if (start === end) {
      setCount(end)
      return
    }

    const duration = 1500
    const stepTime = 30
    const steps = duration / stepTime
    const increment = (end - start) / steps

    const timer = setInterval(() => {
      start += increment
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.round(start))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [startingNumber, endingNumber])

  return (
    <div
      style={styles}
      className="flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
    >
      <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 tracking-tight">
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </div>
      {title && (
        <div className="mt-2 text-sm sm:text-base font-semibold text-gray-700 uppercase tracking-wider text-center">
          {title}
        </div>
      )}
    </div>
  )
}
