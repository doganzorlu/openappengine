import React from 'react'

interface TestimonialProps {
  name: string
  role?: string
  quote: string
  rating?: number
  imageUrl?: string
  accentColor?: string
  cardBg?: string
}

export const Testimonial: React.FC<TestimonialProps> = ({
  name,
  role,
  quote,
  rating = 5,
  imageUrl,
  accentColor = '#F59E0B',
  cardBg = '#FFFFFF',
}) => {
  return (
    <div
      style={{ backgroundColor: cardBg }}
      className="rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between max-w-sm w-full mx-auto my-3 relative overflow-hidden group"
    >
      {/* Decorative Quote Mark */}
      <div
        style={{ color: accentColor }}
        className="absolute top-4 right-6 text-6xl font-serif opacity-15 select-none pointer-events-none group-hover:scale-110 group-hover:opacity-25 transition-all"
      >
        “
      </div>

      <div>
        {/* Star Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{ color: star <= rating ? accentColor : '#E2E8F0' }}
                className="text-base select-none"
              >
                ★
              </span>
            ))}
          </div>
        )}

        {/* Quote Text */}
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed italic mb-6">
          "{quote}"
        </p>
      </div>

      {/* Author Profile */}
      <div className="flex items-center gap-3.5 pt-4 border-t border-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
          />
        ) : (
          <div
            style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base border-2 border-white shadow-sm shrink-0"
          >
            {name ? name.charAt(0).toUpperCase() : '👤'}
          </div>
        )}

        <div className="min-w-0">
          <div className="font-bold text-sm sm:text-base text-gray-900 truncate">
            {name}
          </div>
          {role && (
            <div className="text-xs text-gray-500 truncate">
              {role}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
