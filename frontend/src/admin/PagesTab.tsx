import React, { useEffect, useState } from 'react'

interface PagesTabProps {
  siteSlug: string
  token: string
  userRole: string
  onOpenVisualEditor: (pageSlug: string) => void
}

export const PagesTab: React.FC<PagesTabProps> = ({
  siteSlug,
  token,
  userRole,
  onOpenVisualEditor,
}) => {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [isHome, setIsHome] = useState(false)
  const [creating, setCreating] = useState(false)

  const fetchPages = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/pages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setPages(data.pages || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPages()
  }, [siteSlug])

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle) return
    try {
      setCreating(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug || undefined,
          is_home: isHome,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowAddModal(false)
        setNewTitle('')
        setNewSlug('')
        setIsHome(false)
        fetchPages()
      }
    } catch (e) {
      alert('Sayfa oluşturulurken hata meydana geldi.')
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePage = async (pageId: number) => {
    if (!confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) return
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/pages/${pageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        fetchPages()
      }
    } catch (e) {
      alert('Silinemedi.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Sayfalar</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Sitenizdeki tüm sayfaları yönetin veya görsel editörle canlı düzenleyin.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow flex items-center gap-2 self-start sm:self-auto transition"
        >
          <span>＋</span>
          <span>Yeni Sayfa Ekle</span>
        </button>
      </div>

      {/* Pages List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Sayfalar yükleniyor...</div>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Henüz kayıtlı sayfa bulunmuyor.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pages.map((p) => (
              <div
                key={p.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-gray-900">{p.title}</span>
                    {p.is_home && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                        Ana Sayfa
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">/{p.slug}</div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onOpenVisualEditor(p.slug)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <span>🛠️</span>
                    <span>Görsel Editörde Aç</span>
                  </button>

                  {userRole === 'admin' && (
                    <button
                      onClick={() => handleDeletePage(p.id)}
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

      {/* Add Page Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Yeni Sayfa Ekle</h3>
            <form onSubmit={handleCreatePage} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Sayfa Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="örn: Hakkımızda"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">URL Slug (Boş bırakılırsa otomatik)</label>
                <input
                  type="text"
                  placeholder="örn: hakkimizda"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_home_check"
                  checked={isHome}
                  onChange={(e) => setIsHome(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 cursor-pointer"
                />
                <label htmlFor="is_home_check" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Bu sayfayı sitenin ana sayfası yap
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {creating ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
