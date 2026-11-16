import { useEffect, useState } from 'react'
import type { Site, Menu, PageData } from './types'
import { Navbar } from './components/Navbar'
import { ComponentRenderer } from './components/ComponentRenderer'
import { Footer } from './components/Footer'

export function App() {
  const [site, setSite] = useState<Site | null>(null)
  const [menus, setMenus] = useState<Menu[]>([])
  const [page, setPage] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const siteSlug = 'berilzorlu'

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        // 1. Fetch Site Config & Menus
        const siteRes = await fetch(`/api/v1/sites/${siteSlug}`)
        if (!siteRes.ok) throw new Error('Site verisi yüklenemedi.')
        const siteData = await siteRes.json()
        setSite(siteData.site)
        setMenus(siteData.menus || [])

        // 2. Fetch Homepage Layout
        const pageRes = await fetch(`/api/v1/sites/${siteSlug}/page`)
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
  }, [siteSlug])

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
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
      {/* Top Banner / Multi-tenant demo badge */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-gray-900 text-white py-1.5 px-4 text-center text-xs font-medium flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span>
          <strong>OpenAppEngine v1.0</strong> • Canlı Gösterim: <span className="underline font-semibold">{site.domain}</span> (WordPress & Elementor'dan Dönüştürüldü)
        </span>
      </div>

      {/* Dynamic Navbar */}
      <Navbar site={site} menus={menus} />

      {/* Main Content Area */}
      <main className="flex-1">
        <ComponentRenderer nodes={page.layout} siteSlug={site.slug} />
      </main>

      {/* Dynamic Footer */}
      <Footer site={site} />
    </div>
  )
}

export default App
