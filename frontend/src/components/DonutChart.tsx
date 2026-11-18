import React from 'react'

export interface DonutSlice {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  title?: string
  subtitle?: string
  slices?: DonutSlice[]
  centerLabel?: string
  centerSubtitle?: string
  size?: number
}

export const DonutChart: React.FC<DonutChartProps> = ({
  title = 'Bağış ve Kaynak Kullanım Dağılımı',
  subtitle = 'Tüm bağışlarınız şeffaflık ilkemiz doğrultusunda doğrudan eğitim ve atölyelere aktarılmaktadır.',
  slices = [
    { label: 'Birebir Müzik Terapisi & Eğitim', value: 60, color: '#4F46E5' },
    { label: 'Çalgı & Atölye Materyalleri', value: 25, color: '#06B6D4' },
    { label: 'Konser & Organizasyon Masrafları', value: 15, color: '#F59E0B' },
  ],
  centerLabel = '%100',
  centerSubtitle = 'Şeffaflık',
  size = 220,
}) => {
  const total = slices.reduce((acc, curr) => acc + curr.value, 0) || 1
  const radius = 70
  const circumference = 2 * Math.PI * radius
  let accumulatedPercent = 0

  return (
    <div className="w-full my-6 max-w-3xl mx-auto rounded-3xl p-6 sm:p-10 bg-white border border-gray-100 shadow-xl">
      {title && (
        <div className="text-center mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-12">
        {/* SVG Donut */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 180 180">
            {/* Background Circle */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              className="text-gray-100"
              strokeWidth="24"
              stroke="currentColor"
              fill="transparent"
            />

            {/* Slices */}
            {slices.map((slice, idx) => {
              const percent = (slice.value / total) * 100
              const strokeDasharray = `${(percent * circumference) / 100} ${circumference}`
              const strokeDashoffset = -((accumulatedPercent * circumference) / 100)
              accumulatedPercent += percent

              return (
                <circle
                  key={idx}
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke={slice.color}
                  strokeWidth="24"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              )
            })}
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none">
              {centerLabel}
            </span>
            {centerSubtitle && (
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">
                {centerSubtitle}
              </span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3.5 w-full sm:w-auto">
          {slices.map((slice, idx) => {
            const percent = Math.round((slice.value / total) * 100)
            return (
              <div key={idx} className="flex items-center gap-3">
                <span
                  style={{ backgroundColor: slice.color }}
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                />
                <div className="flex items-baseline justify-between gap-4 w-full sm:min-w-[220px]">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    {slice.label}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-gray-900">
                    %{percent}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
