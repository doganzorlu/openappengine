import React, { useEffect, useState } from 'react'

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
  const [saving, setSaving] = useState(false)

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
    setShowModal(true)
  }

  const openEditPost = (p: any) => {
    setEditingPost(p)
    setTitle(p.title)
    setExcerpt(p.excerpt || '')
    setContent(p.content || '')
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
        body: JSON.stringify({ title, excerpt, content }),
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
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 transition"
              >
                <div className="max-w-xl">
                  <h4 className="font-bold text-sm sm:text-base text-gray-900">{p.title}</h4>
                  {p.excerpt && (
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{p.excerpt}</p>
                  )}
                  <span className="text-[11px] text-gray-400 font-mono mt-1 block">
                    {new Date(p.published_at || p.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => openEditPost(p)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition"
                  >
                    Düzenle
                  </button>

                  {userRole === 'admin' && (
                    <button
                      onClick={() => handleDeletePost(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingPost ? 'Yazıyı Düzenle' : 'Yeni Yazı Ekle'}
            </h3>
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
                  rows={8}
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
    </div>
  )
}
