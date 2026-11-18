import React, { useEffect, useState } from 'react'

interface CookieConsentTabProps {
  siteSlug: string
  token: string
}

interface CookieCategoryConfig {
  enabled: boolean
  required: boolean
  name: string
  desc: string
}

interface CookieConsentSettings {
  enabled: boolean
  position: 'bottom' | 'bottom-left' | 'bottom-right'
  title: string
  message: string
  accept_all_text: string
  reject_text: string
  settings_text: string
  badge_enabled: boolean
  badge_text: string
  categories: {
    necessary: CookieCategoryConfig
    analytics: CookieCategoryConfig
    marketing: CookieCategoryConfig
  }
  policy_modal_title: string
  policy_content: string
}

export const CookieConsentTab: React.FC<CookieConsentTabProps> = ({ siteSlug, token }) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeSection, setActiveSection] = useState<'general' | 'categories' | 'policy'>('general')

  const [settings, setSettings] = useState<CookieConsentSettings>({
    enabled: true,
    position: 'bottom',
    title: '🍪 Çerez ve Gizlilik Tercihleriniz',
    message:
      'Sitemizde kullanıcı deneyimini iyileştirmek, temel işlevleri sunmak ve site trafiğini analiz etmek amacıyla çerezler (cookies) kullanılmaktadır. Detaylı bilgi için KVKK ve Çerez Politikamızı inceleyebilirsiniz.',
    accept_all_text: 'Tümünü Kabul Et',
    reject_text: 'Sadece Zorunluları Kabul Et',
    settings_text: 'Çerez Tercihleri & KVKK',
    badge_enabled: true,
    badge_text: '🍪 Çerez Ayarları',
    categories: {
      necessary: {
        enabled: true,
        required: true,
        name: 'Zorunlu Çerezler',
        desc: 'Sitenin güvenli ve doğru çalışması için zorunludur, kapatılamaz.',
      },
      analytics: {
        enabled: true,
        required: false,
        name: 'Analitik & İstatistik',
        desc: 'Ziyaretçi trafiğini ve sayfa kullanımlarını anonim olarak analiz etmemizi sağlar.',
      },
      marketing: {
        enabled: false,
        required: false,
        name: 'Pazarlama & Sosyal Medya',
        desc: 'İlgi alanlarınıza uygun kişiselleştirilmiş içerik ve duyurular sunar.',
      },
    },
    policy_modal_title: 'KVKK Aydınlatma Metni & Çerez Politikası',
    policy_content: '',
  })

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/cookie-consent`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.cookie_consent) {
        setSettings(data.cookie_consent)
      }
    } catch (e) {
      console.error('Çerez ayarları yüklenemedi:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [siteSlug])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setSaveSuccess(false)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/cookie-consent`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cookie_consent: settings }),
      })
      const data = await res.json()
      if (data.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3500)
      }
    } catch (e) {
      console.error('Ayarlar kaydedilemedi:', e)
    } finally {
      setSaving(false)
    }
  }

  const handleResetStorageInBrowser = () => {
    try {
      localStorage.removeItem(`oae_cookie_consent_${siteSlug}`)
      alert('Tarayıcınızdaki çerez onay tercihiniz sıfırlandı. Sitenizi açtığınızda çerez bildirimini tekrar göreceksiniz.')
    } catch {
      // Ignore
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-500 text-sm">
        <span className="animate-spin text-2xl mr-2">🔄</span> Çerez ve KVKK ayarları yükleniyor...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>🍪</span> Çerez (Cookie) ve KVKK Politikası Yönetimi
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Ziyaretçilerinizin çerez onaylarını toplayın, kategorilere ayırın ve yasal KVKK aydınlatma metninizi yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetStorageInBrowser}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition border border-gray-200 flex items-center gap-1.5"
            title="Kendi tarayıcınızdaki onayı sıfırlayıp bildirimi test edin"
          >
            <span>🔄</span> Bildirimi Sıfırla & Test Et
          </button>
          <a
            href={`/sites/${siteSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-md flex items-center gap-1.5"
          >
            <span>🌐</span> Sitede Canlı Gör
          </a>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span>✅</span> Çerez ve KVKK ayarlarınız başarıyla kaydedildi ve tüm sitede güncellendi!
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 text-xs font-bold">
        {[
          { id: 'general', label: 'Genel & Görünüm', icon: '🎨' },
          { id: 'categories', label: 'Çerez Kategorileri', icon: '📂' },
          { id: 'policy', label: 'KVKK Aydınlatma Metni', icon: '📜' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeSection === tab.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Genel & Görünüm */}
        {activeSection === 'general' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            {/* Enabled Toggle */}
            <div className="flex items-center justify-between p-4 bg-purple-50/50 border border-purple-100 rounded-2xl">
              <div>
                <h4 className="font-bold text-sm text-gray-900">Çerez ve KVKK Bildirimi Aktif</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Açık olduğunda ilk defa gelen ziyaretçilere çerez onay çubuğu gösterilir.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Position */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Bildirim Pozisyonu
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'bottom', label: 'Alt Çubuk (Tam Genişlik)', desc: 'Ekranın en altında yatay şerit' },
                  { id: 'bottom-left', label: 'Sol Alt Kart', desc: 'Sol altta yüzen zarif kart' },
                  { id: 'bottom-right', label: 'Sağ Alt Kart', desc: 'Sağ altta yüzen zarif kart' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, position: pos.id as any })}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      settings.position === pos.id
                        ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-500/20'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-gray-900">{pos.label}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{pos.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Titles & Message */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bildirim Başlığı</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bildirim Açıklama Metni</label>
                <textarea
                  rows={3}
                  value={settings.message}
                  onChange={(e) => setSettings({ ...settings, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-xs"
                />
              </div>
            </div>

            {/* Buttons Text */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  "Tümünü Kabul Et" Butonu
                </label>
                <input
                  type="text"
                  value={settings.accept_all_text}
                  onChange={(e) => setSettings({ ...settings, accept_all_text: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  "Sadece Zorunlular" Butonu
                </label>
                <input
                  type="text"
                  value={settings.reject_text}
                  onChange={(e) => setSettings({ ...settings, reject_text: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  "Tercihler & Ayarlar" Butonu
                </label>
                <input
                  type="text"
                  value={settings.settings_text}
                  onChange={(e) => setSettings({ ...settings, settings_text: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Corner Badge */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-xs text-gray-900">Sabit Çerez Ayarları Rozeti</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Kullanıcı onay verdikten sonra sol altta küçük bir buton bırakarak dilediği zaman ayarları değiştirmesini sağlar.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={settings.badge_text}
                  onChange={(e) => setSettings({ ...settings, badge_text: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                />
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.badge_enabled}
                    onChange={(e) => setSettings({ ...settings, badge_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Çerez Kategorileri */}
        {activeSection === 'categories' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <p className="text-xs text-gray-500">
              Kullanıcılara tercih penceresinde sunulacak çerez kategorilerinin başlık ve açıklamalarını buradan düzenleyebilirsiniz.
            </p>

            {/* Zorunlu */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">1. Zorunlu Çerezler (Kapatılamaz)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Zorunlu
                </span>
              </div>
              <input
                type="text"
                value={settings.categories.necessary.name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    categories: {
                      ...settings.categories,
                      necessary: { ...settings.categories.necessary, name: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
              />
              <textarea
                rows={2}
                value={settings.categories.necessary.desc}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    categories: {
                      ...settings.categories,
                      necessary: { ...settings.categories.necessary, desc: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
              />
            </div>

            {/* Analitik */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">2. Analitik & İstatistik Çerezleri</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  İsteğe Bağlı
                </span>
              </div>
              <input
                type="text"
                value={settings.categories.analytics.name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    categories: {
                      ...settings.categories,
                      analytics: { ...settings.categories.analytics, name: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
              <textarea
                rows={2}
                value={settings.categories.analytics.desc}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    categories: {
                      ...settings.categories,
                      analytics: { ...settings.categories.analytics, desc: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            {/* Pazarlama */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">3. Pazarlama & Sosyal Medya Çerezleri</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                  İsteğe Bağlı
                </span>
              </div>
              <input
                type="text"
                value={settings.categories.marketing.name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    categories: {
                      ...settings.categories,
                      marketing: { ...settings.categories.marketing, name: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
              <textarea
                rows={2}
                value={settings.categories.marketing.desc}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    categories: {
                      ...settings.categories,
                      marketing: { ...settings.categories.marketing, desc: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>
          </div>
        )}

        {/* Section 3: KVKK Aydınlatma Metni */}
        {activeSection === 'policy' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Aydınlatma Penceresi Başlığı
              </label>
              <input
                type="text"
                value={settings.policy_modal_title}
                onChange={(e) => setSettings({ ...settings, policy_modal_title: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Resmi Aydınlatma Metni ve Çerez Politikası İçeriği (HTML Destekli)
                </label>
              </div>
              <textarea
                rows={12}
                value={settings.policy_content}
                onChange={(e) => setSettings({ ...settings, policy_content: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed"
                placeholder="<h3>1. Veri Sorumlusu</h3><p>...</p>"
              />
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="animate-spin text-sm">🔄</span> Kaydediliyor...
              </>
            ) : (
              <>
                <span>💾</span> Ayarları Kaydet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
