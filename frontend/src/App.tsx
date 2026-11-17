import { useEffect, useState, useCallback } from 'react'
import type { Site, Menu, PageData, ComponentNode } from './types'
import { Navbar } from './components/Navbar'
import { ComponentRenderer } from './components/ComponentRenderer'
import { Footer } from './components/Footer'
import { InspectorPanel } from './components/InspectorPanel'
import { AdminLayout } from './admin/AdminLayout'
import { AdminLogin } from './admin/AdminLogin'
import { BlockLibraryModal } from './components/BlockLibraryModal'

interface SiteListItem {
  id: number
  name: string
  slug: string
  domain: string
  description?: string
}

export function App() {
  const [sitesList, setSitesList] = useState<SiteListItem[]>([])
  const [currentSlug, setCurrentSlug] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('site') || ''
  })
  const [currentPageSlug, setCurrentPageSlug] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('page') || ''
  })

  // Mode: 'public' | 'admin'
  const [viewMode, setViewMode] = useState<'public' | 'admin'>(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin'
      ? 'admin'
      : 'public'
  })

  // Auth state
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('openappengine_token')
  })
  const [authUser, setAuthUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('openappengine_user')
    return saved ? JSON.parse(saved) : null
  })

  const [site, setSite] = useState<Site | null>(null)
  const [menus, setMenus] = useState<Menu[]>([])
  const [page, setPage] = useState<PageData | null>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [activePost, setActivePost] = useState<any | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Editor State
  const [isEditorMode, setIsEditorMode] = useState(false)
  const [isEngineBarVisible, setIsEngineBarVisible] = useState(false)
  const [selectedNode, setSelectedNode] = useState<ComponentNode | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isBlockLibraryOpen, setIsBlockLibraryOpen] = useState(false)
  const [blockInsertIndex, setBlockInsertIndex] = useState<number | null>(null)

  // 1. Fetch available sites list once & listen to popstate
  useEffect(() => {
    async function fetchSites() {
      try {
        const res = await fetch('/api/v1/sites')
        if (res.ok) {
          const data = await res.json()
          setSitesList(data.sites || [])
        }
      } catch (e) {
        console.error('Failed to load sites list', e)
      }
    }
    fetchSites()

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      setCurrentSlug(params.get('site') || '')
      setCurrentPageSlug(params.get('page') || '')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // 2. Fetch active site data whenever currentSlug or currentPageSlug changes
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        setSelectedNode(null)

        // 1. Fetch Site Config & Menus (or resolve automatically by domain hostname)
        const endpoint = currentSlug ? `/api/v1/sites/${currentSlug}` : `/api/v1/resolve-site`
        const siteRes = await fetch(endpoint)
        if (!siteRes.ok) throw new Error('Site verisi yüklenemedi.')
        const siteData = await siteRes.json()
        setSite(siteData.site)
        setMenus(siteData.menus || [])
        setIsPopupOpen(Boolean(siteData.site?.settings?.popup?.enabled))
        const activeSlug = siteData.site.slug
        if (!currentSlug) {
          setCurrentSlug(activeSlug)
        }

        // 2. Fetch Active Page & Published Posts
        const pageEndpoint = currentPageSlug
          ? `/api/v1/sites/${activeSlug}/page/${currentPageSlug}`
          : `/api/v1/sites/${activeSlug}/page`
        const [pageRes, postsRes] = await Promise.all([
          fetch(pageEndpoint),
          fetch(`/api/v1/sites/${activeSlug}/posts`),
        ])
        if (!pageRes.ok) throw new Error('Sayfa verisi yüklenemedi.')
        const pageData = await pageRes.json()
        setPage(pageData.page)

        if (postsRes.ok) {
          const postsData = await postsRes.json()
          setPosts(postsData.posts || [])
        } else {
          setPosts([])
        }

        // Set document title and dynamic SEO meta tags
        const seoTitle = pageData.page?.seo?.title || pageData.page?.title || siteData.site?.name || 'OpenAppEngine'
        const seoDesc = pageData.page?.seo?.description || siteData.site?.description || ''
        const seoImage = siteData.site?.settings?.logo_url || ''

        document.title = seoTitle

        const setMetaTag = (selector: string, attr: string, value: string) => {
          let el = document.querySelector(selector)
          if (!el) {
            el = document.createElement('meta')
            if (selector.includes('name=')) {
              const nameMatch = selector.match(/name="([^"]+)"/)
              if (nameMatch) el.setAttribute('name', nameMatch[1])
            } else if (selector.includes('property=')) {
              const propMatch = selector.match(/property="([^"]+)"/)
              if (propMatch) el.setAttribute('property', propMatch[1])
            }
            document.head.appendChild(el)
          }
          el.setAttribute(attr, value)
        }

        if (seoDesc) {
          setMetaTag('meta[name="description"]', 'content', seoDesc)
          setMetaTag('meta[property="og:description"]', 'content', seoDesc)
          setMetaTag('meta[name="twitter:description"]', 'content', seoDesc)
        }
        setMetaTag('meta[property="og:title"]', 'content', seoTitle)
        setMetaTag('meta[name="twitter:title"]', 'content', seoTitle)
        if (seoImage) {
          setMetaTag('meta[property="og:image"]', 'content', seoImage)
        }
      } catch (err: any) {
        setError(err.message || 'Veriler yüklenirken bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentSlug, currentPageSlug])

  // Listen to custom open-post events from cards and nav menus
  useEffect(() => {
    const handleOpenPost = async (e: any) => {
      const slug = e.detail?.slug
      if (!slug) return
      const found = posts.find((p) => p.slug === slug)
      if (found) {
        setActivePost(found)
        return
      }
      try {
        const res = await fetch(`/api/v1/sites/${currentSlug || site?.slug}/posts/${slug}`)
        if (res.ok) {
          const data = await res.json()
          if (data.post) setActivePost(data.post)
        }
      } catch (err) {
        console.error(err)
      }
    }
    window.addEventListener('openappengine:open-post', handleOpenPost as EventListener)
    return () => window.removeEventListener('openappengine:open-post', handleOpenPost as EventListener)
  }, [posts, currentSlug, site])

  // Site switch handler
  const handleSiteChange = (newSlug: string) => {
    setCurrentSlug(newSlug)
    setCurrentPageSlug('')
    const url = new URL(window.location.href)
    url.searchParams.set('site', newSlug)
    url.searchParams.delete('page')
    window.history.pushState({}, '', url.toString())
  }

  // Recursive updater for component nodes in layout tree
  const updateNodeInTree = useCallback(
    (nodes: ComponentNode[], updatedNode: ComponentNode): ComponentNode[] => {
      return nodes.map((n) => {
        if (n.id === updatedNode.id) {
          return updatedNode
        }
        if (n.children && n.children.length > 0) {
          return {
            ...n,
            children: updateNodeInTree(n.children, updatedNode),
          }
        }
        return n
      })
    },
    []
  )

  // Recursive deleter for component nodes
  const deleteNodeInTree = useCallback(
    (nodes: ComponentNode[], nodeId: string): ComponentNode[] => {
      return nodes
        .filter((n) => n.id !== nodeId)
        .map((n) => {
          if (n.children && n.children.length > 0) {
            return {
              ...n,
              children: deleteNodeInTree(n.children, nodeId),
            }
          }
          return n
        })
    },
    []
  )

  const handleUpdateNode = (updatedNode: ComponentNode) => {
    if (!page) return
    setSelectedNode(updatedNode)
    const newLayout = updateNodeInTree(page.layout, updatedNode)
    setPage({ ...page, layout: newLayout })
  }

  const handleDeleteNode = (nodeId: string) => {
    if (!page) return
    setSelectedNode(null)
    const newLayout = deleteNodeInTree(page.layout, nodeId)
    setPage({ ...page, layout: newLayout })
    showToast('Bileşen silindi.')
  }

  // Section level manipulations
  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (!page) return
    const idx = page.layout.findIndex((n) => n.id === sectionId)
    if (idx === -1) return
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= page.layout.length) return

    const newLayout = [...page.layout]
    const [moved] = newLayout.splice(idx, 1)
    newLayout.splice(targetIdx, 0, moved)
    setPage({ ...page, layout: newLayout })
    showToast(direction === 'up' ? '⬆️ Bölüm yukarı taşındı.' : '⬇️ Bölüm aşağı taşındı.')
  }

  function cloneNodeWithNewIds(node: ComponentNode): ComponentNode {
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const prefix = node.type.toLowerCase().slice(0, 3)
    return {
      ...node,
      id: `${prefix}_${randomSuffix}`,
      children: node.children ? node.children.map(cloneNodeWithNewIds) : [],
    }
  }

  const handleDuplicateSection = (sectionId: string) => {
    if (!page) return
    const idx = page.layout.findIndex((n) => n.id === sectionId)
    if (idx === -1) return

    const cloned = cloneNodeWithNewIds(page.layout[idx])
    const newLayout = [...page.layout]
    newLayout.splice(idx + 1, 0, cloned)
    setPage({ ...page, layout: newLayout })
    setSelectedNode(cloned)
    showToast('📋 Bölüm başarıyla çoğaltıldı!')
  }

  const handleDeleteSection = (sectionId: string) => {
    if (!page) return
    if (page.layout.length <= 1) {
      alert('Sayfadaki son bölüm silinemez.')
      return
    }
    if (!window.confirm('Bu bölümü silmek istediğinize emin misiniz?')) return
    const newLayout = page.layout.filter((n) => n.id !== sectionId)
    setPage({ ...page, layout: newLayout })
    if (selectedNode?.id === sectionId) {
      setSelectedNode(null)
    }
    showToast('🗑️ Bölüm silindi.')
  }

  const handleInsertBlock = (newBlock: ComponentNode) => {
    if (!page) return
    const newLayout = [...page.layout]
    if (blockInsertIndex !== null && blockInsertIndex >= 0 && blockInsertIndex <= newLayout.length) {
      newLayout.splice(blockInsertIndex, 0, newBlock)
    } else {
      newLayout.push(newBlock)
    }
    setPage({ ...page, layout: newLayout })
    setSelectedNode(newBlock)
    setIsBlockLibraryOpen(false)
    setBlockInsertIndex(null)
    showToast('✅ Yeni bölüm sayfaya eklendi!')
  }

  const handleSaveLayout = async () => {
    if (!site || !page) return
    try {
      setIsSaving(true)
      const res = await fetch(`/api/v1/sites/${site.slug}/pages/${page.id}/layout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: page.layout }),
      })
      if (!res.ok) throw new Error('Kayıt başarısız oldu.')
      showToast('✅ Düzen başarıyla kaydedildi!')
    } catch (e: any) {
      showToast('❌ Hata: ' + (e.message || 'Kaydedilemedi'))
    } finally {
      setIsSaving(false)
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleLogout = () => {
    localStorage.removeItem('openappengine_token')
    localStorage.removeItem('openappengine_user')
    setAuthToken(null)
    setAuthUser(null)
    setViewMode('public')
  }

  // ==========================================
  // VIEW MODE: ADMIN PANEL
  // ==========================================
  if (viewMode === 'admin') {
    if (!authToken || !authUser) {
      return (
        <AdminLogin
          onLoginSuccess={(token, user) => {
            setAuthToken(token)
            setAuthUser(user)
          }}
          onCancel={() => setViewMode('public')}
        />
      )
    }

    return (
      <AdminLayout
        user={authUser}
        token={authToken}
        currentSlug={currentSlug || site?.slug || 'berilzorlu'}
        onSwitchSite={handleSiteChange}
        onExitAdmin={() => setViewMode('public')}
        onOpenVisualEditor={(_pageSlug) => {
          setViewMode('public')
          setIsEditorMode(true)
        }}
        onLogout={handleLogout}
      />
    )
  }

  // ==========================================
  // VIEW MODE: PUBLIC SITE & VISUAL EDITOR
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-600 space-y-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide uppercase text-gray-500">
          OpenAppEngine Yükleniyor...
        </p>
      </div>
    )
  }

  if (error || !site || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-red-100">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Yükleme Hatası</h2>
          <p className="text-sm text-gray-600 mb-6">{error || 'Site bulunamadı.'}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handleSiteChange('berilzorlu')}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
            >
              Varsayılan Siteye Dön
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition"
            >
              Yeniden Dene
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] w-full max-w-full overflow-x-hidden">
      {/* Top Engine Control Bar (Visible in Editor Mode or when toggled open) */}
      {isEngineBarVisible || isEditorMode ? (
        <header className="sticky top-0 z-50 bg-gray-900 text-white border-b border-gray-800 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between text-xs">
            {/* Left: Brand & Site Switcher */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <strong className="tracking-wider uppercase font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 text-xs sm:text-sm">
                  OpenAppEngine
                </strong>
              </div>

              {/* Site Switcher Dropdown */}
              <div className="relative">
                <select
                  value={currentSlug}
                  onChange={(e) => handleSiteChange(e.target.value)}
                  className="bg-gray-800 text-white font-medium border border-gray-700 rounded-lg px-2 sm:px-3 py-1 pr-6 sm:pr-8 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer text-[11px] sm:text-xs transition max-w-[140px] sm:max-w-none truncate"
                >
                  {sitesList.length > 0 ? (
                    sitesList.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name} ({s.domain})
                      </option>
                    ))
                  ) : (
                    <option value={site.slug}>
                      {site.name} ({site.domain})
                    </option>
                  )}
                </select>
              </div>
            </div>

            {/* Right: Admin Panel button, Visual Editor & Save */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isEditorMode && (
                <>
                  <button
                    onClick={() => {
                      setBlockInsertIndex(null)
                      setIsBlockLibraryOpen(true)
                    }}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1 shadow transition text-[11px] sm:text-xs"
                    title="Hazır Blok Kütüphanesinden Yeni Bölüm Ekle"
                  >
                    <span>🧩</span> Bölüm Ekle
                  </button>

                  <button
                    onClick={handleSaveLayout}
                    disabled={isSaving}
                    className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 shadow transition disabled:opacity-50 text-[11px] sm:text-xs"
                  >
                    {isSaving ? '...' : '💾 Kaydet'}
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setIsEditorMode(!isEditorMode)
                  setSelectedNode(null)
                }}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition shadow text-[11px] sm:text-xs ${
                  isEditorMode
                    ? 'bg-purple-600 text-white hover:bg-purple-500 ring-2 ring-purple-400'
                    : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {isEditorMode ? '👁️ Önizle' : '🛠️ Editör'}
              </button>

              <button
                onClick={() => setViewMode('admin')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white font-semibold flex items-center gap-1 text-[11px] sm:text-xs transition shadow"
              >
                <span>⚙️</span>
                <span className="hidden sm:inline">Yönetim Paneli</span>
              </button>

              {!isEditorMode && (
                <button
                  onClick={() => setIsEngineBarVisible(false)}
                  className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition"
                  title="Üst Çubuğu Gizle (Siteyi Tam Ekran Gör)"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </header>
      ) : (
        /* Discreet Floating Engine Trigger */
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setIsEngineBarVisible(true)}
            className="bg-gray-900/90 hover:bg-gray-900 text-white backdrop-blur-md px-3.5 py-2 rounded-full shadow-2xl border border-gray-700/70 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 group"
            title="OpenAppEngine Menüsünü Aç"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="group-hover:text-purple-300 transition">OpenAppEngine</span>
            <span className="text-[10px] text-gray-400">▲</span>
          </button>
        </div>
      )}

      {/* Dynamic Navbar (Render custom Elementor header if available, otherwise default Navbar) */}
      {site.settings?.header_layout && site.settings.header_layout.length > 0 ? (
        <header className="w-full bg-white shadow-sm border-b border-gray-100 z-30">
          <ComponentRenderer
            nodes={site.settings.header_layout}
            siteSlug={site.slug}
            site={site}
            menus={menus}
            isEditing={false}
            selectedNodeId={null}
            onSelectNode={() => {}}
          />
        </header>
      ) : (
        <Navbar site={site} menus={menus} />
      )}

      {/* Main Workspace (Split layout if Editor is active) */}
      <div className="flex-1 flex w-full">
        <main className="flex-1 min-w-0 transition-all">
          <ComponentRenderer
            nodes={page.layout}
            siteSlug={site.slug}
            site={site}
            menus={menus}
            isEditing={isEditorMode}
            selectedNodeId={selectedNode?.id || null}
            onSelectNode={(node) => setSelectedNode(node)}
            isTopLevel={true}
            onMoveNode={handleMoveSection}
            onDuplicateNode={handleDuplicateSection}
            onDeleteNode={handleDeleteSection}
            onAddBlockAtIndex={(idx) => {
              setBlockInsertIndex(idx)
              setIsBlockLibraryOpen(true)
            }}
          />

          {/* Published Blog Posts / Articles Section (Shown when site has multiple posts and no custom loop carousel) */}
          {posts.length > 1 &&
            !page.layout?.some((s: any) => s.children?.some((c: any) => c.type === 'SlideCarousel')) && (
            <section className="py-16 bg-slate-50 border-t border-gray-100">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Yazılar & Duyurular</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {site.name} güncel haber, duyuru ve makaleleri
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.slice(0, 9).map((post) => (
                    <article
                      key={post.id}
                      onClick={() => setActivePost(post)}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all p-6 flex flex-col justify-between cursor-pointer group"
                    >
                      <div className="space-y-3">
                        {post.published_at && (
                          <div className="text-[11px] font-semibold text-purple-600">
                            {new Date(post.published_at).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                        )}
                        <h3 className="font-bold text-gray-900 text-base group-hover:text-purple-700 transition line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <div
                            className="text-xs text-gray-600 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: post.excerpt }}
                          />
                        )}
                      </div>
                      <div className="pt-4 mt-4 border-t border-gray-50 text-xs font-bold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Devamını Oku</span>
                        <span>&rarr;</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Right Inspector Panel in Editor Mode */}
        {isEditorMode && (
          <InspectorPanel
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>

      {/* Dynamic Footer (Render custom Elementor footer if available, otherwise default Footer) */}
      {site.settings?.footer_layout && site.settings.footer_layout.length > 0 ? (
        <footer className="w-full">
          <ComponentRenderer
            nodes={site.settings.footer_layout}
            siteSlug={site.slug}
            site={site}
            menus={menus}
            isEditing={false}
            selectedNodeId={null}
            onSelectNode={() => {}}
          />
        </footer>
      ) : (
        <Footer site={site} />
      )}

      {/* Site Announcement Popup Modal (e.g. OMYO 2026) */}
      {isPopupOpen && (site.settings as any)?.popup?.image_url && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsPopupOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-[460px] w-full p-4 relative flex flex-col items-center animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 hover:bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-sm shadow z-10"
              aria-label="Kapat"
            >
              ✕
            </button>
            <img
              src={(site.settings as any).popup.image_url}
              alt={site.name}
              className="w-full h-auto max-h-[72vh] object-contain rounded"
            />
            {(site.settings as any).popup.button_text && (
              <button
                type="button"
                onClick={() => {
                  const btnUrl = (site.settings as any).popup.button_url || ''
                  setIsPopupOpen(false)
                  if (btnUrl.includes('post=')) {
                    const params = new URLSearchParams(btnUrl.split('?')[1] || '')
                    const postSlug = params.get('post')
                    if (postSlug) {
                      window.dispatchEvent(new CustomEvent('openappengine:open-post', { detail: { slug: postSlug } }))
                    }
                  }
                }}
                className="mt-3 px-5 py-2 rounded bg-[#333333] hover:bg-black text-white text-xs font-semibold transition shadow"
              >
                {(site.settings as any).popup.button_text}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Post Reader Modal */}
      {activePost && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActivePost(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-10 relative space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePost(null)}
              className="sticky top-2 float-right w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm"
            >
              ✕
            </button>
            <div className="space-y-2 pr-10">
              {activePost.published_at && (
                <div className="text-xs font-bold text-purple-600">
                  {new Date(activePost.published_at).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              )}
              <h1 className="text-xl sm:text-3xl font-black text-gray-900">{activePost.title}</h1>
            </div>
            <div
              className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: activePost.content || activePost.excerpt || '' }}
            />
          </div>
        </div>
      )}

      {/* Block Library Modal */}
      <BlockLibraryModal
        isOpen={isBlockLibraryOpen}
        onClose={() => setIsBlockLibraryOpen(false)}
        onInsertBlock={handleInsertBlock}
        brandColor={site.settings?.brand_color || '#4F46E5'}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-700 text-sm font-semibold flex items-center gap-2 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  )
}

export default App
