import React, { useEffect, useState, useRef } from 'react'

interface MediaTabProps {
  siteSlug: string
  token: string
}

export const MediaTab: React.FC<MediaTabProps> = ({ siteSlug, token }) => {
  const [mediaList, setMediaList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'pdf' | 'doc'>('all')
  const [editingMedia, setEditingMedia] = useState<any | null>(null)
  const [editAltText, setEditAltText] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [galleryModalOpen, setGalleryModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2500)
  }

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

  const isImage = (m: any) => {
    const mime = (m.mime_type || '').toLowerCase()
    const url = (m.file_url || m.name || '').toLowerCase()
    return mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg|avif)$/.test(url)
  }

  const isPdf = (m: any) => {
    const mime = (m.mime_type || '').toLowerCase()
    const url = (m.file_url || m.name || '').toLowerCase()
    return mime === 'application/pdf' || url.endsWith('.pdf')
  }

  const isDoc = (m: any) => {
    const url = (m.file_url || m.name || '').toLowerCase()
    return /\.(doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar)$/.test(url)
  }

  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    const formData = new FormData()
    if (files.length === 1) {
      formData.append('file', files[0])
    } else {
      Array.from(files).forEach((f) => formData.append('files[]', f))
    }

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

  const handleDeleteMedia = async (mediaId: number) => {
    if (!confirm('Bu medya dosyasını kalıcı olarak silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/media/${mediaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setMediaList((prev) => prev.filter((item) => item.id !== mediaId))
        setSelectedIds((prev) => prev.filter((id) => id !== mediaId))
        if (editingMedia?.id === mediaId) setEditingMedia(null)
      }
    } catch (e) {
      alert('Silme işlemi başarısız.')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Seçilen ${selectedIds.length} dosyayı kalıcı olarak silmek istediğinize emin misiniz?`)) return

    try {
      setLoading(true)
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/v1/admin/sites/${siteSlug}/media/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      )
      setSelectedIds([])
      fetchMedia()
    } catch (e) {
      alert('Bazı dosyalar silinemedi.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAltText = async () => {
    if (!editingMedia) return
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/media/${editingMedia.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ alt_text: editAltText }),
      })
      const data = await res.json()
      if (data.success) {
        setMediaList((prev) =>
          prev.map((m) => (m.id === editingMedia.id ? { ...m, alt_text: editAltText } : m))
        )
        setEditingMedia(null)
      }
    } catch (e) {
      alert('Güncellenemedi.')
    }
  }

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const selectAllFiltered = () => {
    const ids = filteredMedia.map((m) => m.id)
    if (selectedIds.length === ids.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(ids)
    }
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const filteredMedia = mediaList.filter((m) => {
    if (typeFilter === 'image' && !isImage(m)) return false
    if (typeFilter === 'pdf' && !isPdf(m)) return false
    if (typeFilter === 'doc' && !isDoc(m) && !isPdf(m)) return false

    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.alt_text || '').toLowerCase().includes(q) ||
      (m.file_url || '').toLowerCase().includes(q)
    )
  })

  const selectedMediaObjects = mediaList.filter((m) => selectedIds.includes(m.id))

  return (
    <div className="space-y-6">
      {/* Header & Upload Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Medya & Doküman Yöneticisi</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Fotoğraf, galeri görselleri, PDF ve dokümanlarınızı yönetin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-purple-700">{selectedIds.length} seçildi</span>
              <button
                type="button"
                onClick={() => setGalleryModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition"
              >
                🖼️ Galeri Oluştur
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition"
              >
                🗑️ Sil
              </button>
            </div>
          )}

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow flex items-center gap-2 cursor-pointer shrink-0 transition"
          >
            <span>{uploading ? '⏳' : '⬆️'}</span>
            <span>{uploading ? 'Yükleniyor...' : 'Dosya / Fotoğraf Yükle'}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt"
            onChange={(e) => {
              if (e.target.files) handleUploadFiles(e.target.files)
            }}
          />
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          dragActive
            ? 'border-purple-600 bg-purple-50/70 scale-[1.01]'
            : 'border-gray-200 hover:border-gray-300 bg-gray-50/40'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          if (e.dataTransfer.files) handleUploadFiles(e.dataTransfer.files)
        }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-gray-500">
          <span className="text-2xl">📥</span>
          <span>
            Fotoğrafları veya PDF belgelerini doğrudan buraya sürükleyip bırakabilirsiniz (Tekli veya çoklu yükleme desteklenir).
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              typeFilter === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tümü ({mediaList.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('image')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              typeFilter === 'image'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>🖼️</span> Fotoğraflar ({mediaList.filter(isImage).length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('pdf')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              typeFilter === 'pdf'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>📄</span> PDF Dokümanları ({mediaList.filter(isPdf).length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('doc')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              typeFilter === 'doc'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>📎</span> Diğer Belgeler ({mediaList.filter((m) => isDoc(m) && !isPdf(m)).length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {filteredMedia.length > 0 && (
            <button
              type="button"
              onClick={selectAllFiltered}
              className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
            >
              {selectedIds.length === filteredMedia.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
            </button>
          )}

          <input
            type="text"
            placeholder="Dosya ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition"
          />
        </div>
      </div>

      {/* Edit Alt Text Modal / Toolbar */}
      {editingMedia && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="w-12 h-12 rounded-xl bg-purple-200 flex items-center justify-center overflow-hidden shrink-0">
              {isImage(editingMedia) ? (
                <img
                  src={editingMedia.file_url || editingMedia.path}
                  alt={editingMedia.alt_text || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl">{isPdf(editingMedia) ? '📄' : '📎'}</span>
              )}
            </div>
            <div className="w-full flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-xs truncate mb-1">
                {editingMedia.name}
              </div>
              <input
                type="text"
                value={editAltText}
                onChange={(e) => setEditAltText(e.target.value)}
                placeholder="Alternatif Metin (SEO / Başlık)"
                className="w-full px-3 py-1.5 rounded-lg border border-purple-300 bg-white text-xs outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveAltText}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => handleDeleteMedia(editingMedia.id)}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs"
            >
              🗑️ Sil
            </button>
            <button
              type="button"
              onClick={() => setEditingMedia(null)}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs transition"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Media Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
            <span className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span>Medya ve belgeler yükleniyor...</span>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <div className="text-4xl mb-2">📁</div>
            Dosya bulunamadı. Yukarıdaki butondan veya sürükleyerek dosya yükleyebilirsiniz.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMedia.map((m) => {
              const displayUrl = m.meta?.webp_url || m.file_url || m.path
              const isCopied = copiedUrl === displayUrl
              const isImg = isImage(m)
              const isPdfFile = isPdf(m)
              const isSelected = selectedIds.includes(m.id)

              return (
                <div
                  key={m.id}
                  className={`group relative rounded-xl border-2 overflow-hidden bg-gray-50 flex flex-col justify-between hover:shadow-md transition-all ${
                    isSelected ? 'border-purple-600 ring-2 ring-purple-200' : 'border-gray-200'
                  }`}
                >
                  {/* Select Checkbox (Top Left) */}
                  <div className="absolute top-2 left-2 z-20">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(m.id)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer shadow"
                    />
                  </div>

                  {/* WebP badge */}
                  {m.meta?.has_webp && (
                    <div className="absolute top-2 left-8 z-10 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      WebP
                    </div>
                  )}

                  {/* Quick Edit Trigger (Top Right) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingMedia(m)
                      setEditAltText(m.alt_text || m.name || '')
                    }}
                    className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow flex items-center justify-center text-[11px] opacity-0 group-hover:opacity-100 transition"
                    title="Düzenle veya Sil"
                  >
                    ⚙️
                  </button>

                  {/* Thumbnail / Representation */}
                  <div
                    onClick={() => copyToClipboard(displayUrl)}
                    className="aspect-square w-full flex items-center justify-center overflow-hidden bg-black/5 cursor-pointer relative"
                    title="URL'yi Kopyalamak İçin Tıklayın"
                  >
                    {isImg ? (
                      <img
                        src={m.file_url || m.path}
                        alt={m.alt_text || ''}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        loading="lazy"
                      />
                    ) : isPdfFile ? (
                      <div className="flex flex-col items-center justify-center gap-1.5 p-3 text-center">
                        <span className="text-4xl">📄</span>
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-black text-[10px] tracking-wider uppercase">
                          PDF
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 p-3 text-center">
                        <span className="text-4xl">📎</span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-black text-[10px] tracking-wider uppercase">
                          {m.name.split('.').pop() || 'BELGE'}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold">
                      {isCopied ? '✅ Kopyalandı!' : '📋 URL Kopyala'}
                    </div>
                  </div>

                  {/* Info Bar */}
                  <div className="p-2 text-[10px] text-gray-600 bg-white flex items-center justify-between border-t border-gray-100">
                    <span className="truncate font-medium">{m.alt_text || m.name}</span>
                    <span className="text-[9px] text-gray-400 shrink-0 ml-1">
                      {m.meta?.webp_size
                        ? `${Math.round(m.meta.webp_size / 1024)} KB`
                        : formatSize(m.size)}
                    </span>
                  </div>

                  {/* Direct Open Link */}
                  <div className="px-2 pb-1.5 bg-white flex justify-end">
                    <a
                      href={m.file_url || m.path}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-purple-600 hover:text-purple-800 font-semibold"
                    >
                      {isPdfFile ? 'PDF Aç ↗' : isImg ? 'Görüntüle ↗' : 'İndir ↗'}
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Gallery Generator Modal */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-gray-900 text-base">
                🖼️ Seçilen {selectedMediaObjects.length} Görsel ile Galeri
              </h3>
              <button
                type="button"
                onClick={() => setGalleryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Seçtiğiniz fotoğrafların URL listesini tek tıkla kopyalayabilir veya SlideCarousel / Galeri bileşenlerinizde kullanabilirsiniz.
            </p>

            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
              {selectedMediaObjects.map((m) => (
                <div key={m.id} className="aspect-square rounded-lg overflow-hidden border bg-white">
                  <img src={m.file_url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700">JSON Dizi Formatı:</span>
              <textarea
                readOnly
                rows={4}
                value={JSON.stringify(
                  selectedMediaObjects.map((m) => ({
                    url: m.file_url,
                    title: m.alt_text || m.name,
                  })),
                  null,
                  2
                )}
                className="w-full font-mono text-[11px] bg-gray-900 text-emerald-400 p-3 rounded-xl outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(
                      selectedMediaObjects.map((m) => ({
                        url: m.file_url,
                        title: m.alt_text || m.name,
                      })),
                      null,
                      2
                    )
                  )
                  alert('JSON kopyalandı!')
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow"
              >
                📋 JSON Kopyala
              </button>
              <button
                type="button"
                onClick={() => setGalleryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
