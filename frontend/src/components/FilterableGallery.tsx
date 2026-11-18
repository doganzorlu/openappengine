import React, { useState } from 'react'

export interface GalleryItem {
  id?: string
  title: string
  category: string
  imageUrl: string
  caption?: string
}

interface FilterableGalleryProps {
  items: GalleryItem[]
  columns?: number
  accentColor?: string
}

export const FilterableGallery: React.FC<FilterableGalleryProps> = ({
  items = [],
  columns = 3,
  accentColor = '#4F46E5',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null)

  // Extract unique categories
  const categories = React.useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.category) set.add(item.category)
    })
    return Array.from(set)
  }, [items])

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter((item) => item.category === selectedCategory)

  const getGridColsClass = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2'
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
      case 3:
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
    }
  }

  return (
    <div className="w-full my-6 max-w-6xl mx-auto">
      {/* Category Filter Pills */}
      {categories.length > 0 && (
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            style={{
              backgroundColor: selectedCategory === 'all' ? accentColor : '#F1F5F9',
              color: selectedCategory === 'all' ? '#FFFFFF' : '#475569',
            }}
            className="px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-xs hover:opacity-90"
          >
            Tümü
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                backgroundColor: selectedCategory === cat ? accentColor : '#F1F5F9',
                color: selectedCategory === cat ? '#FFFFFF' : '#475569',
              }}
              className="px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-xs hover:opacity-90"
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Gallery Grid */}
      <div className={`grid ${getGridColsClass()} gap-5 sm:gap-6`}>
        {filteredItems.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => setLightboxImage(item)}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 aspect-4/3 cursor-pointer bg-slate-100"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
              <span
                style={{ backgroundColor: accentColor }}
                className="self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1.5 shadow"
              >
                {item.category}
              </span>
              <h4 className="font-bold text-sm sm:text-base leading-tight">
                {item.title}
              </h4>
              {item.caption && (
                <p className="text-xs text-gray-300 mt-1 line-clamp-1">
                  {item.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center text-lg hover:bg-black transition cursor-pointer"
            >
              ✕
            </button>
            <img
              src={lightboxImage.imageUrl}
              alt={lightboxImage.title}
              className="w-full max-h-[75vh] object-contain"
            />
            <div className="p-4 bg-gray-900 text-white text-center">
              <h4 className="font-bold text-base">{lightboxImage.title}</h4>
              {lightboxImage.caption && (
                <p className="text-xs text-gray-400 mt-1">{lightboxImage.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
