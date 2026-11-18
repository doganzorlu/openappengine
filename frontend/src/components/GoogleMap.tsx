import React from 'react'

interface GoogleMapProps {
  address?: string
  height?: number
  zoom?: number
  title?: string
  borderRadius?: number
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  address = 'Çanakkale Onsekiz Mart Üniversitesi MSSF',
  height = 380,
  zoom = 14,
  title,
  borderRadius = 24,
}) => {
  const encodedAddress = encodeURIComponent(address)
  const embedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`

  return (
    <div className="w-full my-6 max-w-5xl mx-auto">
      {title && (
        <h3 className="text-lg font-bold text-gray-800 mb-3 text-center sm:text-left">
          {title}
        </h3>
      )}
      <div
        style={{ height: `${height}px`, borderRadius: `${borderRadius}px` }}
        className="w-full overflow-hidden shadow-lg border border-gray-200/90 relative bg-slate-100"
      >
        <iframe
          title={title || address}
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  )
}
