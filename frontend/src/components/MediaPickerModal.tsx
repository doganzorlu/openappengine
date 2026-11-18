import React, { useEffect, useState, useRef } from 'react'

export interface MediaItem {
  id: number | string
  name: string
  filename?: string
  path?: string
  file_url: string
  mime_type?: string
  size?: number
  alt_text?: string
  meta?: any
  created_at?: string
}

export interface MediaPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect?: (media: MediaItem) => void
  onSelectMultiple?: (items: MediaItem[]) => void
  siteSlug: string
  token: string
  allowedTypes?: 'all' | 'image' | 'document'
  multiple?: boolean
  title?: string
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onSelectMultiple,
  siteSlug,
  token,
  allowedTypes = 'all',
  multiple = false,
  title = 'Medya & Dosya Seç',
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [mediaList, setMediaList] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'document'>(allowedTypes)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      console.error('Medya yüklenirken hata:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchMedia()
      setTypeFilter(allowedTypes)
      setSelectedItem(null)
      setSelectedItems([])
      setActiveTab('library')
    }
  }, [isOpen, siteSlug, allowedTypes])

  if (!isOpen) return null

  const isImage = (m: MediaItem) => {
    const mime = (m.mime_type || '').toLowerCase()
    const url = (m.file_url || m.name || '').toLowerCase()
    return mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg|avif)$/.test(url)
  }

  const isPdf = (m: MediaItem) => {
    const mime = (m.mime_type || '').toLowerCase()
    const url = (m.file_url || m.name || '').toLowerCase()
    return mime === 'application/pdf' || url.endsWith('.pdf')
  }

  const isDoc = (m: MediaItem) => {
    const url = (m.file_url || m.name || '').toLowerCase()
    return isPdf(m) || /\.(doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar)$/.test(url)
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
        await fetchMedia()
        setActiveTab('library')
        // Automatically select newly uploaded item if single
        if (!multiple && data.media && !Array.isArray(data.media)) {
          setSelectedItem(data.media)
        } else if (multiple && Array.isArray(data.media)) {
          setSelectedItems(data.media)
        }
      } else {
        alert(data.message || 'Yükleme başarısız.')
      }
    } catch (e) {
      alert('Dosya yüklenirken bir hata oluştu.')
    } finally {
      setUploading(false)
    }
  }

  const toggleSelectItem = (item: MediaItem) => {
    if (multiple) {
      const exists = selectedItems.some((s) => s.id === item.id)
      if (exists) {
        setSelectedItems(selectedItems.filter((s) => s.id !== item.id))
      } else {
        setSelectedItems([...selectedItems, item])
      }
    } else {
      setSelectedItem(item)
    }
  }

  const handleConfirmSelect = () => {
    if (multiple) {
      if (onSelectMultiple) onSelectMultiple(selectedItems)
      onClose()
    } else {
      if (selectedItem && onSelect) onSelect(selectedItem)
      onClose()
    }
  }

  const filteredMedia = mediaList.filter((m) => {
    // Type filter
    if (typeFilter === 'image' && !isImage(m)) return false
    if (typeFilter === 'document' && !isDoc(m)) return false

    // Search query
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.alt_text || '').toLowerCase().includes(q) ||
      (m.file_url || '').toLowerCase().includes(q)
    )
  })

  const formatSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] max-h-[720px] flex flex-col overflow-hidden border border-gray-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-3">
            <span className="text-xl">📁</span>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">{title}</h3>
              <p className="text-xs text-gray-400">
                Tenant: <span className="font-mono font-semibold text-purple-600">{siteSlug}</span>
                {multiple ? ' (Çoklu Seçim Modu)' : ' (Tekil Seçim Modu)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-700 flex items-center justify-center font-bold text-sm transition"
            title="Kapat"
          >
            ✕
          </button>
        </div>

        {/* Tab & Filter Bar */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'library'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>🖼️</span> Medya Kütüphanesi ({mediaList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>⬆️</span> Yeni Dosya Yükle
            </button>
          </div>

          {activeTab === 'library' && (
            <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
              {allowedTypes === 'all' && (
                <div className="inline-flex rounded-lg bg-gray-100 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setTypeFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      typeFilter === 'all' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    Tümü
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('image')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      typeFilter === 'image' ? 'bg-white shadow-xs text-purple-700' : 'text-gray-500'
                    }`}
                  >
                    Fotoğraflar
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('document')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      typeFilter === 'document' ? 'bg-white shadow-xs text-red-700' : 'text-gray-500'
                    }`}
                  >
                    PDF & Belgeler
                  </button>
                </div>
              )}

              <input
                type="text"
                placeholder="Dosya ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 sm:w-56 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition"
              />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'upload' ? (
            <div
              className={`flex-1 m-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-colors ${
                dragActive ? 'border-purple-600 bg-purple-50/50' : 'border-gray-200 bg-gray-50/50'
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
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl mb-4 shadow-sm">
                {uploading ? '⏳' : '☁️'}
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-1">
                {uploading ? 'Dosyalar Yükleniyor...' : 'Dosyaları Buraya Sürükleyip Bırakın'}
              </h4>
              <p className="text-xs text-gray-400 mb-6 text-center max-w-sm">
                Fotoğraflar (JPG, PNG, WebP), PDF belgeleri, Word/Excel veya arşiv dosyaları yükleyebilirsiniz (Maks 50MB/dosya).
              </p>

              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
              >
                <span>📂</span>
                <span>Bilgisayardan Dosya Seç</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept={
                  allowedTypes === 'image'
                    ? 'image/*'
                    : allowedTypes === 'document'
                    ? '.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt'
                    : 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt'
                }
                onChange={(e) => {
                  if (e.target.files) handleUploadFiles(e.target.files)
                }}
              />
            </div>
          ) : (
            <>
              {/* Media Grid */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400 gap-2">
                    <span className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    Medya kütüphanesi yükleniyor...
                  </div>
                ) : filteredMedia.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                    <span className="text-3xl mb-2">🔍</span>
                    Eşleşen medya veya belge bulunamadı.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                    {filteredMedia.map((m) => {
                      const isImg = isImage(m)
                      const isPdfFile = isPdf(m)
                      const isSelected = multiple
                        ? selectedItems.some((s) => s.id === m.id)
                        : selectedItem?.id === m.id

                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleSelectItem(m)}
                          className={`group relative rounded-xl border-2 overflow-hidden bg-gray-50 flex flex-col justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'border-purple-600 ring-4 ring-purple-100 shadow-md scale-[1.02]'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow'
                          }`}
                        >
                          {/* Selection Badge */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow">
                              ✓
                            </div>
                          )}

                          {/* Thumbnail / Document Representation */}
                          <div className="aspect-square w-full flex items-center justify-center overflow-hidden bg-black/5 relative">
                            {isImg ? (
                              <img
                                src={m.file_url || m.path}
                                alt={m.alt_text || ''}
                                className="w-full h-full object-cover transition group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : isPdfFile ? (
                              <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
                                <span className="text-3xl">📄</span>
                                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-black text-[9px] uppercase tracking-wider">
                                  PDF
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
                                <span className="text-3xl">📎</span>
                                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-black text-[9px] uppercase tracking-wider">
                                  {m.name.split('.').pop() || 'BELGE'}
                                </span>
                              </div>
                            )}

                            {/* WebP badge */}
                            {m.meta?.has_webp && (
                              <span className="absolute bottom-1.5 left-1.5 bg-emerald-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                                WebP
                              </span>
                            )}
                          </div>

                          {/* File Label */}
                          <div className="p-2 bg-white text-[10px] text-gray-700 truncate border-t border-gray-100 flex items-center justify-between">
                            <span className="truncate font-medium">{m.alt_text || m.name}</span>
                            <span className="text-[9px] text-gray-400 shrink-0 ml-1">
                              {formatSize(m.size)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar Preview (Single Mode or Inspector) */}
              {!multiple && selectedItem && (
                <div className="w-64 sm:w-72 border-l border-gray-100 p-4 bg-gray-50/50 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b border-gray-200 pb-2">
                      Dosya Detayı
                    </h4>

                    {/* Preview box */}
                    <div className="w-full aspect-video rounded-xl bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300/60 shadow-inner">
                      {isImage(selectedItem) ? (
                        <img
                          src={selectedItem.file_url || selectedItem.path}
                          alt={selectedItem.alt_text || ''}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-4xl">{isPdf(selectedItem) ? '📄' : '📎'}</span>
                          <span className="text-xs font-bold text-gray-700">
                            {isPdf(selectedItem) ? 'PDF Dokümanı' : 'Belge'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Dosya Adı:</span>
                        <span className="font-semibold text-gray-800 break-all">{selectedItem.name}</span>
                      </div>
                      {selectedItem.size && (
                        <div>
                          <span className="text-gray-400 block text-[10px]">Boyut:</span>
                          <span className="font-semibold text-gray-800">{formatSize(selectedItem.size)}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400 block text-[10px]">Bağlantı:</span>
                        <a
                          href={selectedItem.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 hover:underline break-all block text-[11px]"
                        >
                          {selectedItem.file_url}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleConfirmSelect}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <span>✓</span> Bu Dosyayı Seç
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer (Multi Mode) */}
        {multiple && activeTab === 'library' && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-xs font-semibold text-gray-600">
              {selectedItems.length > 0 ? (
                <span className="text-purple-600 font-bold">{selectedItems.length} dosya seçildi.</span>
              ) : (
                'Lütfen eklemek istediğiniz dosyaları tıklayarak seçin.'
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-100"
              >
                İptal
              </button>
              <button
                type="button"
                disabled={selectedItems.length === 0}
                onClick={handleConfirmSelect}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
              >
                <span>✓</span> Seçilenleri Kullan ({selectedItems.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
