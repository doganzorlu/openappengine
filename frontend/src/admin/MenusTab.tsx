import React, { useEffect, useState } from 'react'
import { MediaPickerModal, type MediaItem } from '../components/MediaPickerModal'

interface MenusTabProps {
  siteSlug: string
  token: string
  userRole: string
}

export const MenusTab: React.FC<MenusTabProps> = ({ siteSlug, token }) => {
  const [menus, setMenus] = useState<any[]>([])
  const [pages, setPages] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [mediaFiles, setMediaFiles] = useState<any[]>([])
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // New Menu form
  const [newMenuName, setNewMenuName] = useState('')
  const [newMenuLocation, setNewMenuLocation] = useState('header')

  // New Item form
  const [itemTitle, setItemTitle] = useState('')
  const [itemUrl, setItemUrl] = useState('')
  const [itemTarget, setItemTarget] = useState('_self')
  const [itemParentId, setItemParentId] = useState<number | null>(null)

  // Editing item state
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editTarget, setEditTarget] = useState('_self')
  const [editParentId, setEditParentId] = useState<number | null>(null)

  // Selected pages/posts/media for bulk add
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)

  const fetchMenusAndData = async () => {
    try {
      setLoading(true)
      const [menusRes, pagesRes, postsRes, mediaRes] = await Promise.all([
        fetch(`/api/v1/admin/sites/${siteSlug}/menus`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/v1/admin/sites/${siteSlug}/pages`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/v1/admin/sites/${siteSlug}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/v1/admin/sites/${siteSlug}/media`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      const menusData = await menusRes.json()
      const pagesData = await pagesRes.json()
      const postsData = await postsRes.json()
      const mediaData = await mediaRes.json()

      if (menusData.success) {
        const list = menusData.menus || []
        setMenus(list)
        if (list.length > 0 && (!selectedMenuId || !list.some((m: any) => m.id === selectedMenuId))) {
          setSelectedMenuId(list[0].id)
        }
      }
      if (pagesData.success) {
        setPages(pagesData.pages || [])
      }
      if (postsData.success) {
        setPosts(postsData.posts || [])
      }
      if (mediaData.success) {
        setMediaFiles(mediaData.media || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenusAndData()
  }, [siteSlug])

  const selectedMenu = menus.find((m) => m.id === selectedMenuId) || null

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMenuName.trim()) return

    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/menus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newMenuName.trim(), location: newMenuLocation }),
      })
      const data = await res.json()
      if (data.success) {
        setNewMenuName('')
        setMenus([...menus, data.menu])
        setSelectedMenuId(data.menu.id)
      }
    } catch (e) {
      alert('Menü oluşturulurken hata oluştu.')
    }
  }

  const handleDeleteMenu = async (menuId: number) => {
    if (!confirm('Bu menüyü ve içindeki tüm bağlantıları silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/menus/${menuId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        const remaining = menus.filter((m) => m.id !== menuId)
        setMenus(remaining)
        setSelectedMenuId(remaining[0]?.id || null)
      }
    } catch (e) {
      alert('Menü silinemedi.')
    }
  }

  const handleAddItem = async (title: string, url: string, target: string = '_self', parentId: number | null = null) => {
    if (!selectedMenu || !title.trim() || !url.trim()) return
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/menus/${selectedMenu.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim(),
          target,
          parent_id: parentId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setItemTitle('')
        setItemUrl('')
        setItemParentId(null)
        fetchMenusAndData()
      }
    } catch (e) {
      alert('Menü öğesi eklenemedi.')
    }
  }

  const handleAddMultiplePages = async () => {
    if (selectedPages.length === 0 || !selectedMenu) return
    for (const slug of selectedPages) {
      const p = pages.find((page) => page.slug === slug)
      if (p) {
        const url = p.is_home ? `/?site=${siteSlug}` : `/?site=${siteSlug}&page=${p.slug}`
        await handleAddItem(p.title, url, '_self')
      }
    }
    setSelectedPages([])
  }

  const handleAddMultiplePosts = async () => {
    if (selectedPosts.length === 0 || !selectedMenu) return
    for (const slug of selectedPosts) {
      const p = posts.find((post) => post.slug === slug)
      if (p) {
        const url = `/?site=${siteSlug}&post=${p.slug}`
        await handleAddItem(p.title, url, '_self')
      }
    }
    setSelectedPosts([])
  }

  const handleAddMultipleMedia = async () => {
    if (selectedMedia.length === 0 || !selectedMenu) return
    for (const fileUrl of selectedMedia) {
      const m = mediaFiles.find((file) => (file.file_url || file.path) === fileUrl)
      if (m) {
        await handleAddItem(m.alt_text || m.name, m.file_url || m.path, '_blank')
      }
    }
    setSelectedMedia([])
  }

  const handleUpdateItem = async (itemId: number) => {
    if (!selectedMenu) return
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/menus/${selectedMenu.id}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          url: editUrl,
          target: editTarget,
          parent_id: editParentId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setEditingItemId(null)
        fetchMenusAndData()
      }
    } catch (e) {
      alert('Güncellenemedi.')
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!selectedMenu) return
    if (!confirm('Bu menü öğesini ve varsa alt öğelerini silmek istediğinize emin misiniz?')) return

    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/menus/${selectedMenu.id}/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        fetchMenusAndData()
      }
    } catch (e) {
      alert('Silinemedi.')
    }
  }

  const handleIndentItem = async (item: any, prevItem: any) => {
    if (!selectedMenu || !prevItem) return
    // Make item a child of prevItem
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/menus/${selectedMenu.id}/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ parent_id: prevItem.id }),
      })
      if (res.ok) fetchMenusAndData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleOutdentItem = async (item: any) => {
    if (!selectedMenu || !item.parent_id) return
    // Make item a root level item
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/menus/${selectedMenu.id}/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ parent_id: null }),
      })
      if (res.ok) fetchMenusAndData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    if (!selectedMenu || !selectedMenu.items) return
    const items = [...selectedMenu.items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return

    const temp = items[index]
    items[index] = items[targetIndex]
    items[targetIndex] = temp

    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/menus/${selectedMenu.id}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((it, idx) => ({
            id: it.id,
            parent_id: it.parent_id || null,
            sort_order: idx + 1,
          })),
        }),
      })
      const data = await res.json()
      if (data.success) {
        fetchMenusAndData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const topLevelItems = (selectedMenu?.items || []).filter((it: any) => !it.parent_id)
  const getSubItems = (parentId: number) => (selectedMenu?.items || []).filter((it: any) => it.parent_id === parentId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Menü & Navigasyon Tasarımı</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Açılır (dropdown) alt menüler, çapa linkler ve çok seviyeli menü ağacınızı tasarlayın.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-3">
          <span className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span>Menüler yükleniyor...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Menu Selector & Quick Add Blocks */}
          <div className="lg:col-span-5 space-y-5">
            {/* Menu Selection & Creation Box */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                  <span>🧭</span> Düzenlenecek Menü
                </h3>
                {selectedMenu && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMenu(selectedMenu.id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    Menüyü Sil
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedMenuId || ''}
                  onChange={(e) => setSelectedMenuId(Number(e.target.value))}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.location === 'header' ? 'Üst Menü' : 'Alt Menü'}) - {m.items?.length || 0} öğe
                    </option>
                  ))}
                </select>
              </div>

              {/* Create New Menu Accordion */}
              <form onSubmit={handleCreateMenu} className="pt-3 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Yeni Menü Adı..."
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none"
                />
                <select
                  value={newMenuLocation}
                  onChange={(e) => setNewMenuLocation(e.target.value)}
                  className="px-2.5 py-2 rounded-xl border border-gray-200 text-xs bg-white outline-none"
                >
                  <option value="header">Üst (Header)</option>
                  <option value="footer">Alt (Footer)</option>
                </select>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shrink-0 shadow-xs"
                >
                  Oluştur
                </button>
              </form>
            </div>

            {/* Quick Add 1: Sayfa İçi Çapalar (Anchors) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>⚓</span> Sayfa İçi Bölüm Çapaları (Hızlı Ekle)
              </h4>
              <p className="text-[11px] text-gray-500">
                Ana sayfadaki bölümlere doğrudan kaydıran linkler:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { title: 'Hakkımızda', url: '#hakkimizda' },
                  { title: 'Etkinlikler', url: '#etkinlikler' },
                  { title: 'Bilgi Bankası', url: '#bilgibankasi' },
                  { title: 'Basında Biz', url: '#basindabiz' },
                  { title: 'Başvuru', url: '#basvuru' },
                  { title: 'İletişim & Adres', url: '#iletisim' },
                ].map((anchor) => (
                  <button
                    key={anchor.url}
                    type="button"
                    onClick={() => handleAddItem(anchor.title, anchor.url, '_self')}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 hover:border-purple-300 text-[11px] font-semibold transition"
                  >
                    + {anchor.title} ({anchor.url})
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Add 2: Sayfalar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>📄</span> Sayfalar ({pages.length})
                </h4>
                {selectedPages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddMultiplePages}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                  >
                    Seçilenleri Ekle ({selectedPages.length})
                  </button>
                )}
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 border border-gray-100 rounded-xl p-2 bg-gray-50">
                {pages.map((p) => {
                  const isChecked = selectedPages.includes(p.slug)
                  return (
                    <label key={p.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer p-1 rounded hover:bg-white">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) setSelectedPages(selectedPages.filter((s) => s !== p.slug))
                          else setSelectedPages([...selectedPages, p.slug])
                        }}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="truncate">{p.title}</span>
                      {p.is_home && <span className="text-[10px] text-purple-600 font-bold">(Ana Sayfa)</span>}
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Quick Add 3: Blog / Yazılar */}
            {posts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>✍️</span> Blog & Duyuru Yazıları ({posts.length})
                  </h4>
                  {selectedPosts.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddMultiplePosts}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                    >
                      Seçilenleri Ekle ({selectedPosts.length})
                    </button>
                  )}
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 border border-gray-100 rounded-xl p-2 bg-gray-50">
                  {posts.map((p) => {
                    const isChecked = selectedPosts.includes(p.slug)
                    return (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer p-1 rounded hover:bg-white">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) setSelectedPosts(selectedPosts.filter((s) => s !== p.slug))
                            else setSelectedPosts([...selectedPosts, p.slug])
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="truncate">{p.title}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quick Add 4: Dokümanlar & Dosyalar (PDF & Belgeler) */}
            {mediaFiles.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>📁</span> Belgeler & Medya ({mediaFiles.length})
                  </h4>
                  {selectedMedia.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddMultipleMedia}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                    >
                      Seçilenleri Ekle ({selectedMedia.length})
                    </button>
                  )}
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 border border-gray-100 rounded-xl p-2 bg-gray-50">
                  {mediaFiles.map((m) => {
                    const isChecked = selectedMedia.includes(m.file_url || m.path)
                    const isPdf = (m.mime_type || '').includes('pdf') || (m.name || '').endsWith('.pdf')
                    return (
                      <label key={m.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer p-1 rounded hover:bg-white">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const url = m.file_url || m.path
                            if (isChecked) setSelectedMedia(selectedMedia.filter((s) => s !== url))
                            else setSelectedMedia([...selectedMedia, url])
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm">{isPdf ? '📄' : '📎'}</span>
                        <span className="truncate flex-1">{m.alt_text || m.name}</span>
                        {isPdf && <span className="text-[9px] text-red-600 font-bold bg-red-50 px-1 rounded">PDF</span>}
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quick Add 5: Özel Bağlantı (Custom Link) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔗</span> Özel Bağlantı Ekle
                </h4>
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  <span>📁</span> Medya / PDF Seç
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Bağlantı Metni (örn: Kurullar veya İletişim)"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="URL (örn: #kurullar veya https://...)"
                  value={itemUrl}
                  onChange={(e) => setItemUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none"
                />
                <div className="flex gap-2">
                  <select
                    value={itemParentId || ''}
                    onChange={(e) => setItemParentId(e.target.value ? Number(e.target.value) : null)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white outline-none"
                  >
                    <option value="">Üst Menü: (Yok - Ana Menü)</option>
                    {topLevelItems.map((it: any) => (
                      <option key={it.id} value={it.id}>
                        ↳ {it.title} altına ekle
                      </option>
                    ))}
                  </select>

                  <select
                    value={itemTarget}
                    onChange={(e) => setItemTarget(e.target.value)}
                    className="w-28 px-2.5 py-2 rounded-xl border border-gray-200 text-xs bg-white outline-none"
                  >
                    <option value="_self">Aynı Sekme</option>
                    <option value="_blank">Yeni Sekme</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddItem(itemTitle, itemUrl, itemTarget, itemParentId)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
                >
                  Menüye Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Menu Hierarchy Tree & Live Preview */}
          <div className="lg:col-span-7 space-y-5">
            {/* Live Navigation Bar Preview */}
            <div className="bg-gray-900 rounded-2xl p-5 text-white shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-gray-800 pb-2">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Canlı Navigasyon Çubuğu Önizlemesi
                </span>
                <span className="text-gray-400 font-mono text-[10px]">
                  {selectedMenu?.location === 'header' ? 'Header Navbar' : 'Footer Menu'}
                </span>
              </div>

              {/* Simulated Navbar */}
              <div className="bg-white rounded-xl p-3 text-gray-800 shadow-md overflow-x-auto">
                <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  {topLevelItems.length === 0 ? (
                    <span className="text-gray-400 text-xs italic">Menüde henüz öğe yok.</span>
                  ) : (
                    topLevelItems.map((it: any) => {
                      const subItems = getSubItems(it.id)
                      const hasSub = subItems.length > 0

                      return (
                        <div key={it.id} className="relative group/nav py-1 px-2 rounded hover:bg-gray-100 cursor-pointer">
                          <span className="flex items-center gap-1 text-[#333333] hover:text-[#0077B6] transition">
                            {it.title}
                            {hasSub && <span className="text-[10px]">▾</span>}
                          </span>

                          {hasSub && (
                            <div className="absolute left-0 top-full pt-1.5 z-30 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all">
                              <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 min-w-[180px] flex flex-col">
                                {subItems.map((sub: any) => (
                                  <span
                                    key={sub.id}
                                    className="px-3.5 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-[#0077B6] transition font-medium"
                                  >
                                    {sub.title}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </nav>
              </div>
            </div>

            {/* Menu Items Hierarchy Tree List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                  <span>🌳</span> Menü Ağacı & Sıralama
                </h3>
                <span className="text-xs text-gray-400">
                  {selectedMenu?.items?.length || 0} bağlantı
                </span>
              </div>

              <p className="text-xs text-gray-500">
                Öğeleri yukarı/aşağı taşıyabilir, <b>➡️ Girintile</b> ile bir önceki öğenin açılır (dropdown) alt menüsü yapabilir veya <b>⬅️ Çıkıntıla</b> ile ana menü seviyesine geri getirebilirsiniz.
              </p>

              {!selectedMenu || selectedMenu.items?.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-xs">
                  Menüde bağlantı bulunmuyor. Sol taraftaki hızlı ekleme araçlarını kullanabilirsiniz.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedMenu.items.map((item: any, idx: number) => {
                    const isChild = Boolean(item.parent_id)
                    const prevItem = idx > 0 ? selectedMenu.items[idx - 1] : null
                    const isEditing = editingItemId === item.id

                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border transition-all ${
                          isChild
                            ? 'ml-8 sm:ml-10 border-purple-200 bg-purple-50/40'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        } p-3`}
                      >
                        {isEditing ? (
                          <div className="space-y-3 animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-purple-300 text-xs outline-none"
                                placeholder="Başlık"
                              />
                              <input
                                type="text"
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-purple-300 text-xs outline-none"
                                placeholder="URL"
                              />
                            </div>
                            <div className="flex gap-2">
                              <select
                                value={editParentId || ''}
                                onChange={(e) => setEditParentId(e.target.value ? Number(e.target.value) : null)}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                              >
                                <option value="">Üst Menü: (Yok - Ana Menü)</option>
                                {selectedMenu.items
                                  .filter((it: any) => it.id !== item.id && !it.parent_id)
                                  .map((it: any) => (
                                    <option key={it.id} value={it.id}>
                                      ↳ {it.title} altına yerleştir
                                    </option>
                                  ))}
                              </select>
                              <select
                                value={editTarget}
                                onChange={(e) => setEditTarget(e.target.value)}
                                className="w-28 px-2 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                              >
                                <option value="_self">Aynı Sekme</option>
                                <option value="_blank">Yeni Sekme</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(item.id)}
                                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                              >
                                Kaydet
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingItemId(null)}
                                className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-xs"
                              >
                                İptal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isChild ? (
                                <span className="text-purple-600 font-bold text-base select-none">↳</span>
                              ) : (
                                <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                              )}

                              <div className="min-w-0">
                                <div className="font-bold text-gray-900 text-xs sm:text-sm truncate flex items-center gap-1.5">
                                  <span>{item.title}</span>
                                  {isChild && (
                                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[9px] font-bold">
                                      Açılır Alt Menü
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-400 font-mono truncate">{item.url}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                              {/* Indent / Outdent Controls */}
                              {!isChild && prevItem && (
                                <button
                                  type="button"
                                  onClick={() => handleIndentItem(item, prevItem)}
                                  className="px-2 py-1 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold transition flex items-center gap-1"
                                  title="Bir önceki öğenin alt menüsü yap"
                                >
                                  <span>➡️</span> Girintile
                                </button>
                              )}
                              {isChild && (
                                <button
                                  type="button"
                                  onClick={() => handleOutdentItem(item)}
                                  className="px-2 py-1 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] font-bold transition flex items-center gap-1"
                                  title="Ana menü seviyesine geri taşı"
                                >
                                  <span>⬅️</span> Çıkıntıla
                                </button>
                              )}

                              {/* Up / Down Reorder */}
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveItem(idx, 'up')}
                                className="p-1 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-20 text-xs"
                                title="Yukarı Taşı"
                              >
                                ⬆️
                              </button>
                              <button
                                type="button"
                                disabled={idx === selectedMenu.items.length - 1}
                                onClick={() => handleMoveItem(idx, 'down')}
                                className="p-1 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-20 text-xs"
                                title="Aşağı Taşı"
                              >
                                ⬇️
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItemId(item.id)
                                  setEditTitle(item.title)
                                  setEditUrl(item.url)
                                  setEditTarget(item.target || '_self')
                                  setEditParentId(item.parent_id || null)
                                }}
                                className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700"
                              >
                                ✏️
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id)}
                                className="px-2 py-1 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(media: MediaItem) => {
          setItemTitle(media.alt_text || media.name)
          setItemUrl(media.file_url || (media as any).path)
          setItemTarget('_blank')
          setIsMediaModalOpen(false)
        }}
        siteSlug={siteSlug}
        token={token}
        allowedTypes="all"
        title="Menü Bağlantısı İçin Doküman veya Medya Seç"
      />
    </div>
  )
}
