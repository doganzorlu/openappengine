import React, { useEffect, useState } from 'react'

interface MenusTabProps {
  siteSlug: string
  token: string
  userRole: string
}

export const MenusTab: React.FC<MenusTabProps> = ({ siteSlug, token, userRole }) => {
  const [menus, setMenus] = useState<any[]>([])
  const [pages, setPages] = useState<any[]>([])
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // New Menu form
  const [newMenuName, setNewMenuName] = useState('')
  const [newMenuLocation, setNewMenuLocation] = useState('header')

  // New Item form
  const [itemTitle, setItemTitle] = useState('')
  const [itemUrl, setItemUrl] = useState('')
  const [itemTarget, setItemTarget] = useState('_self')

  // Editing item state
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editTarget, setEditTarget] = useState('_self')

  const fetchMenusAndPages = async () => {
    try {
      setLoading(true)
      const [menusRes, pagesRes] = await Promise.all([
        fetch(`/api/v1/admin/sites/${siteSlug}/menus`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/v1/admin/sites/${siteSlug}/pages`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      const menusData = await menusRes.json()
      const pagesData = await pagesRes.json()

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
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenusAndPages()
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

  const handleAddItem = async (title: string, url: string, target: string = '_self') => {
    if (!selectedMenu || !title.trim() || !url.trim()) return
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/menus/${selectedMenu.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), url: url.trim(), target }),
      })
      const data = await res.json()
      if (data.success) {
        setItemTitle('')
        setItemUrl('')
        fetchMenusAndPages()
      }
    } catch (e) {
      alert('Menü öğesi eklenemedi.')
    }
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
        body: JSON.stringify({ title: editTitle, url: editUrl, target: editTarget }),
      })
      const data = await res.json()
      if (data.success) {
        setEditingItemId(null)
        fetchMenusAndPages()
      }
    } catch (e) {
      alert('Güncellenemedi.')
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!selectedMenu) return
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/menus/${selectedMenu.id}/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        fetchMenusAndPages()
      }
    } catch (e) {
      alert('Silinemedi.')
    }
  }

  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    if (!selectedMenu || !selectedMenu.items) return
    const items = [...selectedMenu.items]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= items.length) return

    const temp = items[index]
    items[index] = items[targetIdx]
    items[targetIdx] = temp

    try {
      await fetch(`/api/v1/admin/sites/${siteSlug}/menus/${selectedMenu.id}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ item_ids: items.map((i: any) => i.id) }),
      })
      fetchMenusAndPages()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Menü & Navigasyon Yönetimi</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Sitenizin üst (header) ve alt (footer) menü bağlantılarını oluşturun ve sıralayın.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-xs text-gray-400">
          Menüler yükleniyor...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Menu Selector + Quick Add */}
          <div className="space-y-6">
            {/* Menus List & Create */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">Mevcut Menüler</h3>
              {menus.length === 0 ? (
                <p className="text-xs text-gray-400">Henüz menü oluşturulmamış.</p>
              ) : (
                <div className="space-y-1.5">
                  {menus.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMenuId(m.id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs font-semibold transition ${
                        selectedMenuId === m.id
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div>
                        <div>{m.name}</div>
                        <div className={`text-[10px] ${selectedMenuId === m.id ? 'text-purple-200' : 'text-gray-400'}`}>
                          Konum: {m.location || 'header'} • {m.items?.length || 0} öğe
                        </div>
                      </div>
                      {userRole === 'admin' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteMenu(m.id)
                          }}
                          className={`px-2 py-1 rounded text-[10px] ${
                            selectedMenuId === m.id ? 'hover:bg-purple-700 text-purple-100' : 'hover:bg-red-50 text-red-500'
                          }`}
                          title="Menüyü Sil"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleCreateMenu} className="pt-3 border-t border-gray-100 space-y-2.5">
                <div className="text-xs font-bold text-gray-700">Yeni Menü Oluştur</div>
                <input
                  type="text"
                  placeholder="Menü Adı (ör: Ana Menü)"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <div className="flex gap-2">
                  <select
                    value={newMenuLocation}
                    onChange={(e) => setNewMenuLocation(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    <option value="header">Üst Menü (Header)</option>
                    <option value="footer">Alt Menü (Footer)</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition"
                  >
                    + Ekle
                  </button>
                </div>
              </form>
            </div>

            {/* Add Custom Link */}
            {selectedMenu && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm">Özel Bağlantı Ekle</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleAddItem(itemTitle, itemUrl, itemTarget)
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Bağlantı Metni</label>
                    <input
                      type="text"
                      placeholder="Örn: Hakkımızda"
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">URL / Hedef Adres</label>
                    <input
                      type="text"
                      placeholder="Örn: #about veya /?site=..."
                      value={itemUrl}
                      onChange={(e) => setItemUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Açılış Şekli</label>
                    <select
                      value={itemTarget}
                      onChange={(e) => setItemTarget(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                    >
                      <option value="_self">Aynı Sekmede Aç (_self)</option>
                      <option value="_blank">Yeni Sekmede Aç (_blank)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    + Menüye Bağlantı Ekle
                  </button>
                </form>

                {/* Quick Add from Pages */}
                {pages.length > 0 && (
                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <div className="text-xs font-bold text-gray-700">Sayfalardan Hızlı Ekle</div>
                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                      {pages.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-gray-50 text-xs"
                        >
                          <span className="truncate font-medium text-gray-700">{p.title}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleAddItem(
                                p.title,
                                p.is_home ? `/?site=${siteSlug}` : `/?site=${siteSlug}&page=${p.slug}`
                              )
                            }
                            className="text-[11px] font-bold text-purple-600 hover:text-purple-800 shrink-0 ml-2"
                          >
                            + Ekle
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right 2 Columns: Menu Items List & Reorder */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              {!selectedMenu ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  Düzenlemek için soldan bir menü seçin veya yeni menü oluşturun.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="font-black text-gray-900 text-base">{selectedMenu.name} Öğeleri</h3>
                      <p className="text-xs text-gray-400">
                        Ok butonlarıyla sıralamayı değiştirebilir veya öğeleri düzenleyebilirsiniz.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-bold text-xs">
                      {selectedMenu.items?.length || 0} Bağlantı
                    </span>
                  </div>

                  {!selectedMenu.items || selectedMenu.items.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-xs">
                      Bu menüde henüz bağlantı yok. Sol panelden sayfa veya özel bağlantı ekleyebilirsiniz.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedMenu.items.map((item: any, idx: number) => {
                        const isEditing = editingItemId === item.id
                        return (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            {isEditing ? (
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                                  placeholder="Başlık"
                                />
                                <input
                                  type="text"
                                  value={editUrl}
                                  onChange={(e) => setEditUrl(e.target.value)}
                                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                                  placeholder="URL"
                                />
                                <div className="flex gap-1.5">
                                  <select
                                    value={editTarget}
                                    onChange={(e) => setEditTarget(e.target.value)}
                                    className="px-2 py-1.5 rounded-lg border border-gray-300 text-xs bg-white flex-1"
                                  >
                                    <option value="_self">Aynı Sekme</option>
                                    <option value="_blank">Yeni Sekme</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItem(item.id)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                                  >
                                    Kaydet
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingItemId(null)}
                                    className="px-2.5 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-xs"
                                  >
                                    İptal
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                                      {item.title}
                                    </div>
                                    <div className="text-[11px] text-gray-400 font-mono truncate">{item.url}</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveItem(idx, 'up')}
                                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-30 text-xs"
                                    title="Yukarı Taşı"
                                  >
                                    ⬆️
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === selectedMenu.items.length - 1}
                                    onClick={() => handleMoveItem(idx, 'down')}
                                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-30 text-xs"
                                    title="Aşağı Taşı"
                                  >
                                    ⬇️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingItemId(item.id)
                                      setEditTitle(item.title)
                                      setEditUrl(item.url)
                                      setEditTarget(item.target || '_self')
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700"
                                  >
                                    ✏️ Düzenle
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="px-2.5 py-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
