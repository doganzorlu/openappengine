import React from 'react'

interface DashboardTabProps {
  stats: any
  onNavigateTab: (tabId: string) => void
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ stats, onNavigateTab }) => {
  if (!stats) return null

  const cards = [
    { id: 'pages', label: 'Sayfalar', count: stats.pagesCount, icon: '📄', color: 'from-blue-600 to-cyan-500' },
    { id: 'posts', label: 'Yazılar / Blog', count: stats.postsCount, icon: '✍️', color: 'from-purple-600 to-indigo-500' },
    { id: 'forms', label: 'Formlar', count: stats.formsCount, icon: '📝', color: 'from-amber-500 to-orange-500' },
    { id: 'forms', label: 'Gelen İletiler', count: stats.submissionsCount, icon: '📬', color: 'from-emerald-600 to-teal-500' },
    { id: 'media', label: 'Medya & Galeri', count: stats.mediaCount, icon: '🖼️', color: 'from-pink-600 to-rose-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-gray-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            {stats.userRole === 'admin' ? '👑 Yönetici Paneli' : '✏️ Editör Paneli'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2">
            {stats.site.name}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300">
            Alan Adı: <span className="underline font-mono">{stats.site.domain}</span>
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('importer')}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-white text-gray-900 text-xs sm:text-sm font-bold shadow hover:bg-gray-100 transition active:scale-95 flex items-center gap-2"
        >
          <span>📥</span>
          <span>WordPress İçe Aktar</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            onClick={() => onNavigateTab(card.id)}
            className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-2xl sm:text-3xl font-black text-gray-900">{card.count}</span>
            </div>
            <div className="mt-3 text-xs sm:text-sm font-semibold text-gray-600">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>📬</span>
            <span>Son Gelen İletişim / Başvuru Mesajları</span>
          </h3>
          <button
            onClick={() => onNavigateTab('forms')}
            className="text-xs font-semibold text-purple-600 hover:text-purple-800"
          >
            Tümünü Gör →
          </button>
        </div>

        {stats.recentSubmissions && stats.recentSubmissions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {stats.recentSubmissions.map((sub: any) => (
              <div key={sub.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                <div>
                  <div className="font-semibold text-gray-800">
                    {sub.data?.name || sub.data?.ad_soyad || 'İsimsiz Gönderi'}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {sub.data?.email || 'E-posta belirtilmedi'} • Form: <span className="font-medium text-gray-700">{sub.form?.name || 'Form'}</span>
                  </div>
                  {sub.data?.message && (
                    <p className="text-gray-600 text-xs mt-1 italic line-clamp-1">
                      "{sub.data.message}"
                    </p>
                  )}
                </div>
                <div className="text-[11px] text-gray-400 font-mono whitespace-nowrap">
                  {new Date(sub.created_at).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400 text-xs sm:text-sm">
            Henüz yeni bir form mesajı veya başvuru bulunmuyor.
          </div>
        )}
      </div>
    </div>
  )
}
