import { useEffect, useState, useCallback } from 'react'
import type { Site, Menu, PageData, ComponentNode } from './types'
import { Navbar } from './components/Navbar'
import { ComponentRenderer } from './components/ComponentRenderer'
import { Footer } from './components/Footer'
import { InspectorPanel } from './components/InspectorPanel'

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

  const [site, setSite] = useState<Site | null>(null)
  const [menus, setMenus] = useState<Menu[]>([])
  const [page, setPage] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Editor State
  const [isEditorMode, setIsEditorMode] = useState(false)
  const [selectedNode, setSelectedNode] = useState<ComponentNode | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // 1. Fetch available sites list once
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
  }, [])

  // 2. Fetch active site data whenever currentSlug changes
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
        const activeSlug = siteData.site.slug

        // 2. Fetch Homepage Layout
        const pageRes = await fetch(`/api/v1/sites/${activeSlug}/page`)
        if (!pageRes.ok) throw new Error('Sayfa verisi yüklenemedi.')
        const pageData = await pageRes.json()
        setPage(pageData.page)

        // Set document title
        if (pageData.page?.seo?.title) {
          document.title = pageData.page.seo.title
        }
      } catch (err: any) {
        setError(err.message || 'Veriler yüklenirken bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentSlug])

  // Site switch handler
  const handleSiteChange = (newSlug: string) => {
    setCurrentSlug(newSlug)
    const url = new URL(window.location.href)
    url.searchParams.set('site', newSlug)
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
    <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
      {/* Top Engine Control Bar */}
      <header className="sticky top-0 z-50 bg-gray-900 text-white border-b border-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between text-xs">
          {/* Left: Brand & Site Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <strong className="tracking-wider uppercase font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 text-sm">
                OpenAppEngine
              </strong>
            </div>

            {/* Site Switcher Dropdown */}
            <div className="relative">
              <select
                value={currentSlug}
                onChange={(e) => handleSiteChange(e.target.value)}
                className="bg-gray-800 text-white font-medium border border-gray-700 rounded-lg px-3 py-1.5 pr-8 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer text-xs transition"
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

          {/* Right: Mode Toggle & Action Buttons */}
          <div className="flex items-center gap-2">
            {isEditorMode && (
              <button
                onClick={handleSaveLayout}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow transition disabled:opacity-50"
              >
                {isSaving ? 'Kaydediliyor...' : '💾 Düzeni Kaydet'}
              </button>
            )}

            <button
              onClick={() => {
                setIsEditorMode(!isEditorMode)
                setSelectedNode(null)
              }}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition shadow ${
                isEditorMode
                  ? 'bg-purple-600 text-white hover:bg-purple-500 ring-2 ring-purple-400 ring-offset-1 ring-offset-gray-900'
                  : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {isEditorMode ? '👁️ Önizleme Modu' : '🛠️ Görsel Editör'}
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Navbar */}
      <Navbar site={site} menus={menus} />

      {/* Main Workspace (Split layout if Editor is active) */}
      <div className="flex-1 flex w-full">
        <main className="flex-1 min-w-0 transition-all">
          <ComponentRenderer
            nodes={page.layout}
            siteSlug={site.slug}
            isEditing={isEditorMode}
            selectedNodeId={selectedNode?.id || null}
            onSelectNode={(node) => setSelectedNode(node)}
          />
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

      {/* Dynamic Footer */}
      <Footer site={site} />

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
