import React, { useState, useEffect } from 'react'
import { DashboardTab } from './DashboardTab'
import { PagesTab } from './PagesTab'
import { PostsTab } from './PostsTab'
import { FormsTab } from './FormsTab'
import { MediaTab } from './MediaTab'
import { PopupTab } from './PopupTab'
import { MenusTab } from './MenusTab'
import { ImporterTab } from './ImporterTab'
import { SettingsTab } from './SettingsTab'
import { TenantsTab } from './TenantsTab'

interface AdminLayoutProps {
  user: any
  token: string
  currentSlug: string
  onSwitchSite: (slug: string) => void
  onExitAdmin: () => void
  onOpenVisualEditor: (pageSlug: string) => void
  onLogout: () => void
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  token,
  currentSlug,
  onSwitchSite,
  onExitAdmin,
  onOpenVisualEditor,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState(() => {
    return new URLSearchParams(window.location.search).get('tab') || 'dashboard'
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState<any | null>(null)
  const [sitesList, setSitesList] = useState<any[]>([])

  const currentRole = user?.is_super_admin ? 'admin' : user?.roles?.[currentSlug] || 'editor'

  // Fetch available sites list
  useEffect(() => {
    async function loadSites() {
      try {
        const res = await fetch('/api/v1/sites')
        const data = await res.json()
        if (data.sites) {
          // If super admin, show all sites. If editor, filter by authorized sites
          if (user?.is_super_admin) {
            setSitesList(data.sites)
          } else {
            const userSiteSlugs = Object.keys(user?.roles || {})
            setSitesList(data.sites.filter((s: any) => userSiteSlugs.includes(s.slug)))
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadSites()
  }, [user])

  // Fetch dashboard stats for current site
  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(`/api/v1/admin/sites/${currentSlug}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [currentSlug])

  const menuItems = [
    ...(user?.is_super_admin ? [{ id: 'tenants', label: 'Tenantlar & Siteler', icon: '🏢' }] : []),
    { id: 'dashboard', label: 'Başlangıç', icon: '📊' },
    { id: 'pages', label: 'Sayfalar', icon: '📄' },
    { id: 'menus', label: 'Menüler & Navigasyon', icon: '🧭' },
    { id: 'posts', label: 'Yazılar & Blog', icon: '✍️' },
    { id: 'forms', label: 'Gelen İletiler', icon: '📬' },
    { id: 'media', label: 'Medya & Doküman', icon: '📁' },
    { id: 'popup', label: 'Popup & Duyuru', icon: '🪟' },
    { id: 'settings', label: 'Site Yönetimi & Ekip', icon: '⚙️', adminOnly: true },
    { id: 'importer', label: 'WordPress Importer', icon: '📥', adminOnly: true },
  ]

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-gray-900 text-white border-b border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white focus:outline-none"
              aria-label="Menüyü Aç"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <strong className="tracking-wider uppercase font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 text-sm sm:text-base">
                OpenAppEngine
              </strong>
              <span className="text-gray-500 text-xs hidden sm:inline">| Yönetim Paneli</span>
            </div>
          </div>

          {/* Right: Site switcher & user controls */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs">
            {/* Site Switcher / Tenant Indicator */}
            {sitesList.length > 1 ? (
              <select
                value={activeTab === 'tenants' ? '__tenants__' : currentSlug}
                onChange={(e) => {
                  if (e.target.value === '__tenants__') {
                    setActiveTab('tenants')
                  } else {
                    onSwitchSite(e.target.value)
                    if (activeTab === 'tenants') setActiveTab('dashboard')
                  }
                }}
                className="bg-gray-800 text-white font-medium border border-gray-700 rounded-xl px-2.5 sm:px-3 py-1.5 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer text-xs"
              >
                {sitesList.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name} ({s.domain})
                  </option>
                ))}
                {user?.is_super_admin && (
                  <option value="__tenants__" className="bg-purple-900 font-bold">
                    🏢 Tüm Tenantları Yönet...
                  </option>
                )}
              </select>
            ) : (
              <div className="flex items-center gap-1.5 bg-purple-950/70 border border-purple-800/50 px-3 py-1.5 rounded-xl text-xs text-purple-200">
                <span>🏢</span>
                <span className="font-bold text-white">{sitesList[0]?.name || currentSlug}</span>
              </div>
            )}

            {/* Role Badge */}
            <span
              className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] hidden sm:inline ${
                currentRole === 'admin'
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-700'
                  : 'bg-blue-900/60 text-blue-300 border border-blue-700'
              }`}
            >
              {currentRole === 'admin' ? '👑 Admin' : '✏️ Editör'}
            </span>

            {/* Exit to site button */}
            <button
              onClick={onExitAdmin}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1 transition"
            >
              <span>👁️</span>
              <span className="hidden sm:inline">Siteyi Gör</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Çıkış Yap"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex-1 flex py-6 gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0 space-y-1">
          <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm mb-4">
            <div className="text-xs text-gray-400">Giriş Yapan:</div>
            <div className="font-bold text-gray-900 text-sm truncate">{user?.name}</div>
            <div className="text-[11px] text-purple-700 font-mono mt-0.5">
              Kod: {user?.user_code || 'admin'} • Rol: {currentRole}
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              if (item.adminOnly && currentRole !== 'admin') return null
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-xs sm:text-sm transition text-left ${
                    active
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Slide-Over Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm flex">
            <div className="w-72 bg-white h-full shadow-2xl p-5 flex flex-col justify-between animate-slide-in">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="font-bold text-sm text-gray-900">Menü</div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl text-xs">
                  <div className="font-bold text-purple-900">{user?.name}</div>
                  <div className="text-purple-700">Rolünüz: {currentRole.toUpperCase()}</div>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    if (item.adminOnly && currentRole !== 'admin') return null
                    const active = activeTab === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition text-left ${
                          active
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-2">
                <button
                  onClick={onExitAdmin}
                  className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-800 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <span>👁️</span>
                  <span>Siteyi Canlı Gör</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>

            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Tab Content Body */}
        <main className="flex-1 min-w-0">
          {activeTab === 'tenants' && (
            <TenantsTab
              token={token}
              isSuperAdmin={Boolean(user?.is_super_admin)}
              onSelectTenant={(slug) => {
                onSwitchSite(slug)
                setActiveTab('dashboard')
              }}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardTab stats={stats} onNavigateTab={handleTabClick} />
          )}

          {activeTab === 'pages' && (
            <PagesTab
              siteSlug={currentSlug}
              token={token}
              userRole={currentRole}
              onOpenVisualEditor={onOpenVisualEditor}
            />
          )}

          {activeTab === 'menus' && (
            <MenusTab siteSlug={currentSlug} token={token} userRole={currentRole} />
          )}

          {activeTab === 'posts' && (
            <PostsTab siteSlug={currentSlug} token={token} userRole={currentRole} />
          )}

          {activeTab === 'forms' && (
            <FormsTab siteSlug={currentSlug} token={token} />
          )}

          {activeTab === 'media' && (
            <MediaTab siteSlug={currentSlug} token={token} />
          )}

          {activeTab === 'popup' && (
            <PopupTab siteSlug={currentSlug} token={token} />
          )}

          {activeTab === 'importer' && (
            <ImporterTab
              siteSlug={currentSlug}
              token={token}
              userRole={currentRole}
              onImportSuccess={fetchDashboardStats}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab siteSlug={currentSlug} token={token} userRole={currentRole} />
          )}
        </main>
      </div>
    </div>
  )
}
