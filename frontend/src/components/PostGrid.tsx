import React, { useEffect, useState } from 'react'

interface PostGridProps {
  siteSlug: string
  count?: number
  columns?: number
  showImage?: boolean
  showDate?: boolean
  showExcerpt?: boolean
  readMoreText?: string
  accentColor?: string
  posts?: any[]
}

export const PostGrid: React.FC<PostGridProps> = ({
  siteSlug,
  count = 3,
  columns = 3,
  showImage = true,
  showDate = true,
  showExcerpt = true,
  readMoreText = 'Devamını Oku →',
  accentColor = '#4F46E5',
  posts: propPosts,
}) => {
  const [posts, setPosts] = useState<any[]>(propPosts || [])
  const [loading, setLoading] = useState<boolean>(!propPosts)

  useEffect(() => {
    if (propPosts && propPosts.length > 0) {
      setPosts(propPosts)
      setLoading(false)
      return
    }

    if (!siteSlug) return

    let isMounted = true
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/v1/sites/${siteSlug}/posts`)
        if (res.ok) {
          const data = await res.json()
          if (isMounted) {
            setPosts(data.posts || [])
          }
        }
      } catch (err) {
        console.error('PostGrid yüklenirken hata:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchPosts()
    return () => {
      isMounted = false
    }
  }, [siteSlug, propPosts])

  const displayedPosts = posts.slice(0, count)

  const handlePostClick = (post: any) => {
    window.dispatchEvent(
      new CustomEvent('openappengine:open-post', { detail: { slug: post.slug } })
    )
  }

  const gridColsClass =
    columns === 1
      ? 'grid-cols-1 max-w-2xl'
      : columns === 2
      ? 'grid-cols-1 md:grid-cols-2 max-w-4xl'
      : columns === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl'

  if (loading) {
    return (
      <div className={`grid ${gridColsClass} gap-6 w-full mx-auto my-6`}>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs animate-pulse space-y-4"
          >
            <div className="w-full h-44 bg-gray-200 rounded-2xl" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (displayedPosts.length === 0) {
    return (
      <div className="w-full py-10 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 my-4">
        Henüz yayınlanmış bir yazı bulunmuyor.
      </div>
    )
  }

  return (
    <div className={`grid ${gridColsClass} gap-6 w-full mx-auto my-6 items-stretch`}>
      {displayedPosts.map((post) => {
        const imageSrc = post.featured_image || post.image_url
        return (
          <article
            key={post.id || post.slug}
            onClick={() => handlePostClick(post)}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group"
          >
            <div>
              {/* Optional Featured Image */}
              {showImage && (
                <div className="aspect-16/10 w-full overflow-hidden bg-slate-100 relative">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300 bg-gradient-to-br from-slate-100 to-slate-200">
                      📰
                    </div>
                  )}
                </div>
              )}

              {/* Post Content */}
              <div className="p-5 sm:p-6 space-y-2.5">
                {showDate && post.published_at && (
                  <span
                    style={{ color: accentColor }}
                    className="text-[11px] font-bold tracking-wider uppercase block"
                  >
                    {new Date(post.published_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}

                <h3 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-purple-700 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>

                {showExcerpt && post.excerpt && (
                  <div
                    className="text-xs text-gray-500 line-clamp-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
                  />
                )}
              </div>
            </div>

            {/* Read More Footer */}
            <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-gray-50 flex items-center justify-between">
              <span
                style={{ color: accentColor }}
                className="text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
              >
                {readMoreText}
              </span>
            </div>
          </article>
        )
      })}
    </div>
  )
}
