import React, { useState } from 'react'

interface McpTabProps {
  siteSlug: string
  token: string
}

export const McpTab: React.FC<McpTabProps> = ({ siteSlug, token }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [configType, setConfigType] = useState<'claude' | 'cursor'>('claude')
  void siteSlug;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 3000)
  }

  const serverUrl = window.location.origin.includes('localhost')
    ? 'http://localhost:11001'
    : window.location.origin

  const activeToken = token || 'oae_admin_live_token_2026'

  const claudeDesktopConfig = JSON.stringify(
    {
      mcpServers: {
        openappengine: {
          command: 'node',
          args: ['/Users/dogan/Documents/Projects/ownprojects/OpenAppEngine/mcp/openappengine-mcp.js'],
          env: {
            OPENAPPENGINE_URL: serverUrl,
            OPENAPPENGINE_TOKEN: activeToken,
          },
        },
      },
    },
    null,
    2
  )

  const cursorAntigravityConfig = JSON.stringify(
    {
      mcpServers: {
        openappengine: {
          command: 'node',
          args: ['./mcp/openappengine-mcp.js'],
          env: {
            OPENAPPENGINE_URL: serverUrl,
            OPENAPPENGINE_TOKEN: activeToken,
          },
        },
      },
    },
    null,
    2
  )

  const toolsList = [
    { name: 'preview_page_screenshot', desc: 'Sitenin canlı render edilmiş ekran görüntüsünü AI ajanına resim olarak sunar. Yapay zekanın tasarımını görsel olarak denetlemesini sağlar.', badge: 'Görsel Doğrulama (Visual)' },
    { name: 'get_component_catalog', desc: 'Sitedeki tüm 40+ bileşenin özelliklerini (props), stil parametrelerini ve hazır şablonlarını AI ajanına tam rehber olarak verir.', badge: 'Tasarım Sistemi (Blueprint)' },
    { name: 'get_site_structure', desc: 'Sitenin sayfalarını, menülerini, formlarını ve tema renklerini tek bakışta analiz eder.', badge: 'Mimari' },
    { name: 'list_sites', desc: 'Sistemdeki tüm web sitelerini ve tenantları listeler.', badge: 'Tenant' },
    { name: 'get_site_details', desc: 'Sitenin renk temasını, domainini ve genel ayarlarını inceler.', badge: 'Tema' },
    { name: 'update_site_theme', desc: 'Sitenin ana renklerini (primary, secondary) ve yazı tipini günceller.', badge: 'Tema' },
    { name: 'list_pages', desc: 'Sitedeki tüm sayfaları ve yayın durumlarını listeler.', badge: 'Sayfa' },
    { name: 'create_page', desc: 'Sıfırdan yeni bir sayfa (başlık, slug, SEO ve layout) oluşturur.', badge: 'Sayfa' },
    { name: 'delete_page', desc: 'Mevcut bir sayfayı sistemden kaldırır.', badge: 'Sayfa' },
    { name: 'get_page_layout', desc: 'Bir sayfanın tüm bileşen ağacını (JSON layout) AI analizine sunar.', badge: 'Sayfa' },
    { name: 'update_page_layout', desc: 'Sayfa düzenini doğrudan günceller, yeni bileşenler ekler veya siler.', badge: 'Görsel Editör' },
    { name: 'add_page_section', desc: 'Mevcut bir sayfaya doğrudan yeni bir bölüm bloğu ekler.', badge: 'Görsel Editör' },
    { name: 'list_menus', desc: 'Sitedeki tüm navigasyon menülerini listeler.', badge: 'Navigasyon' },
    { name: 'update_menu', desc: 'Menüdeki bağlantıları ve sıralamayı günceller.', badge: 'Navigasyon' },
    { name: 'list_posts', desc: 'Yayınlanan veya taslak haber/duyuru makalelerini listeler.', badge: 'Blog' },
    { name: 'create_post', desc: 'AI tarafından sıfırdan yeni bir blog yazısı veya duyuru yayınlar.', badge: 'Blog' },
    { name: 'list_submissions', desc: 'Form başvurularını, ön kayıtları ve gelen kutusunu filtreli sorgular.', badge: 'DataTable' },
    { name: 'update_submission_status', desc: 'Başvuru akışını günceller (Onayla, Reddet, İnceleniyor) ve not ekler.', badge: 'Akış' },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Yapay Zeka & MCP Ajan Entegrasyonu
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
              v1.0 Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            OpenAppEngine sitenizi <strong>Claude Desktop, Cursor, Antigravity</strong> veya özel AI ajanlarına bağlayarak sitenizi yapay zekayla yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
            Model Context Protocol
          </span>
        </div>
      </div>

      {/* Grid: Credentials & Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* API Credentials */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <span>🔑</span>
              <span>API Bağlantı Anahtarı (Master Token)</span>
            </h3>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              Aktif
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-gray-500 block mb-1">Sunucu Base URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={serverUrl}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs select-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(serverUrl, 'url')}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer transition"
                >
                  {copiedKey === 'url' ? '✓' : 'Kopyala'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 block mb-1">Bearer API Token</label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  readOnly
                  value={activeToken}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs select-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(activeToken, 'token')}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer transition shadow"
                >
                  {copiedKey === 'token' ? '✓ Kopyalandı' : 'Kopyala'}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
              Bu token sitenizin yönetimini yapay zeka ajanlarına devreder. Güvenliğiniz için gizli tutunuz.
            </p>
          </div>
        </div>

        {/* 1-Click Config for Claude Desktop & Cursor */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfigType('claude')}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  configType === 'claude' ? 'bg-purple-100 text-purple-800' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Claude Desktop
              </button>
              <button
                type="button"
                onClick={() => setConfigType('cursor')}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  configType === 'cursor' ? 'bg-purple-100 text-purple-800' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Cursor / Antigravity
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  configType === 'claude' ? claudeDesktopConfig : cursorAntigravityConfig,
                  'json'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold cursor-pointer transition"
            >
              {copiedKey === 'json' ? '✓ Kopyalandı' : '📋 JSON Kopyala'}
            </button>
          </div>

          <div className="text-xs space-y-2">
            <p className="text-gray-500 text-[11px]">
              Aşağıdaki JSON bloğunu{' '}
              <code>{configType === 'claude' ? 'claude_desktop_config.json' : 'mcp.json / Cursor settings'}</code>{' '}
              dosyanıza yapıştırın:
            </p>
            <pre className="p-3 bg-gray-900 text-gray-200 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-40 leading-relaxed">
              {configType === 'claude' ? claudeDesktopConfig : cursorAntigravityConfig}
            </pre>
          </div>
        </div>
      </div>

      {/* Available AI Capabilities (Tools) */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-200/80 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Desteklenen MCP Yetenekleri (Tools)</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              AI modelinizin siteniz üzerinde çağırabileceği hazır 10 araç:
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold font-mono">
            {toolsList.length} Araç Hazır
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {toolsList.map((tool) => (
            <div key={tool.name} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-purple-50/20 transition">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-purple-700 text-xs bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    {tool.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {tool.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{tool.desc}</p>
              </div>
              <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 shrink-0">
                <span>●</span> Aktif
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Example Prompts to give AI */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="font-black text-sm uppercase tracking-wider text-purple-300 flex items-center gap-2">
          <span>💬</span>
          <span>Örnek AI Sohbet İstekleri (Prompt Örnekleri)</span>
        </h3>
        <p className="text-xs text-purple-100">
          MCP bağlantısını kurduktan sonra Claude Desktop veya Cursor'a doğrudan şu cümleleri söyleyebilirsiniz:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/15 transition backdrop-blur-sm">
            <span className="font-bold text-amber-300 block mb-1">🎨 Tema Değişimi:</span>
            "Otizm Müzik Okulu sitesinin ana temasını koyu lacivert (#023e8a) ve turuncuya çevir."
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/15 transition backdrop-blur-sm">
            <span className="font-bold text-emerald-300 block mb-1">📋 Başvuru Yönetimi:</span>
            "Bugün gelen başvurulardan keman branşına başvuran adayları onayla ve not ekle."
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/15 transition backdrop-blur-sm">
            <span className="font-bold text-indigo-300 block mb-1">✍️ İçerik Üretimi:</span>
            "Yaz okulu 2026 hakkında heyecan verici bir açılış haberi yaz ve blogda yayınla."
          </div>
        </div>
      </div>
    </div>
  )
}
