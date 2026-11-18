import React, { useEffect, useState } from 'react'
import { MediaPickerModal, type MediaItem } from '../components/MediaPickerModal'

interface PostsTabProps {
  siteSlug: string
  token: string
  userRole: string
}

export const PostsTab: React.FC<PostsTabProps> = ({ siteSlug, token, userRole }) => {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<any | null>(null)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [status, setStatus] = useState<'published' | 'draft'>('published')
  const [saving, setSaving] = useState(false)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setPosts(data.posts || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [siteSlug])

  const openNewPost = () => {
    setEditingPost(null)
    setTitle('')
    setExcerpt('')
    setContent('')
    setFeaturedImage('')
    setStatus('published')
    setShowModal(true)
  }

  const openEditPost = (p: any) => {
    setEditingPost(p)
    setTitle(p.title)
    setExcerpt(p.excerpt || '')
    setContent(p.content || '')
    setFeaturedImage(p.featured_image || '')
    setStatus(p.status || 'published')
    setShowModal(true)
  }

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const url = editingPost
        ? `/api/v1/admin/sites/${siteSlug}/posts/${editingPost.id}`
        : `/api/v1/admin/sites/${siteSlug}/posts`
      const method = editingPost ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          featured_image: featuredImage,
          status,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        fetchPosts()
      }
    } catch (e) {
      alert('Kaydedilemedi.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePost = async (id: number) => {
    if (!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        fetchPosts()
      }
    } catch (e) {
      alert('Silinemedi.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Yazılar & Blog</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Haberler, duyurular ve makale içeriklerini yönetin.
          </p>
        </div>

        <button
          onClick={openNewPost}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow flex items-center gap-2 self-start sm:self-auto transition"
        >
          <span>＋</span>
          <span>Yeni Yazı Ekle</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Yazılar yükleniyor...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Henüz yayınlanmış yazı bulunmuyor.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {posts.map((p) => (
              <div
                key={p.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80 transition"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Thumbnail / Placeholder */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {p.featured_image ? (
                      <img
                        src={p.featured_image}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl opacity-40">📰</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'draft'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.status === 'draft' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        />
                        {p.status === 'draft' ? 'Taslak' : 'Yayında'}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {new Date(p.published_at || p.created_at).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                      {p.title}
                    </h4>
                    {p.excerpt && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{p.excerpt}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => openEditPost(p)}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition"
                  >
                    Düzenle
                  </button>

                  {userRole === 'admin' && (
                    <button
                      onClick={() => handleDeletePost(p.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition"
                    >
                      Sil
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-lg font-black text-gray-900">
                {editingPost ? 'Yazıyı Düzenle' : 'Yeni Yazı Ekle'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Yazı Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Başlık girin..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none text-sm"
                />
              </div>

              {/* Featured Image Selector */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Öne Çıkan Görsel (Kapak Fotoğrafı)
                </label>
                {featuredImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 group bg-gray-50 max-h-48 flex items-center justify-center">
                    <img
                      src={featuredImage}
                      alt="Featured Preview"
                      className="w-full max-h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMediaModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-white text-gray-900 font-bold text-xs shadow hover:bg-gray-100"
                      >
                        Değiştir
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeaturedImage('')}
                        className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow hover:bg-red-700"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="w-full py-4 border-2 border-dashed border-gray-200 hover:border-purple-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:text-purple-600 transition bg-slate-50 hover:bg-purple-50/30 gap-1"
                  >
                    <span className="text-2xl">🖼️</span>
                    <span className="font-semibold text-xs">
                      Medya Kütüphanesinden Kapak Görseli Seç
                    </span>
                  </button>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Yayın Durumu</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('published')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      status === 'published'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Yayında</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      status === 'draft'
                        ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Taslak Olarak Kaydet</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Özet (Excerpt)</label>
                <textarea
                  rows={2}
                  placeholder="Kısa özet..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">İçerik (HTML / Metin) *</label>
                <textarea
                  rows={7}
                  required
                  placeholder="Yazı içeriği..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none font-sans"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(item: MediaItem) => {
          setFeaturedImage(item.file_url)
          setIsMediaModalOpen(false)
        }}
        siteSlug={siteSlug}
        token={token}
        allowedTypes="image"
        title="Kapak Görseli Seç"
      />
    </div>
  )
}
