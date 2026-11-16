import React, { useEffect, useState } from 'react'

interface MediaTabProps {
  siteSlug: string
  token: string
}

export const MediaTab: React.FC<MediaTabProps> = ({ siteSlug, token }) => {
  const [mediaList, setMediaList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/media`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setMediaList(data.media || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [siteSlug])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/media`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        fetchMedia()
      } else {
        alert(data.message || 'Yükleme başarısız.')
      }
    } catch (e) {
      alert('Yükleme sırasında hata oluştu.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Medya & Galeri</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Sitenizde kullanacağınız fotoğrafları, logoları ve afişleri yükleyin ve yönetin.
          </p>
        </div>

        <label className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow flex items-center gap-2 cursor-pointer self-start sm:self-auto transition">
          <span>{uploading ? '⏳' : '⬆️'}</span>
          <span>{uploading ? 'Yükleniyor...' : 'Yeni Görsel Yükle'}</span>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Görseller yükleniyor...</div>
        ) : mediaList.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            <div className="text-3xl mb-2">🖼️</div>
            Henüz yüklenmiş medya dosyası bulunmuyor. Yukarıdaki butondan görsel yükleyebilirsiniz.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaList.map((m) => (
              <div
                key={m.id}
                className="group relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex flex-col justify-between"
              >
                <div className="aspect-square w-full flex items-center justify-center overflow-hidden bg-black/5">
                  <img
                    src={m.path}
                    alt={m.alt_text || ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                    loading="lazy"
                  />
                </div>
                <div className="p-2 text-[10px] text-gray-600 truncate bg-white">
                  {m.alt_text || m.filename}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
