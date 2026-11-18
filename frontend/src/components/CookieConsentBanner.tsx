import React, { useState, useEffect } from 'react'
import type { Site } from '../types'

export interface CookieCategory {
  enabled: boolean
  required: boolean
  name: string
  desc: string
}

export interface CookieConsentData {
  enabled?: boolean
  position?: 'bottom' | 'bottom-left' | 'bottom-right'
  title?: string
  message?: string
  accept_all_text?: string
  reject_text?: string
  settings_text?: string
  badge_enabled?: boolean
  badge_text?: string
  categories?: {
    necessary?: CookieCategory
    analytics?: CookieCategory
    marketing?: CookieCategory
  }
  policy_modal_title?: string
  policy_content?: string
}

interface CookieConsentBannerProps {
  site?: Site | null
  siteSlug: string
  isEditing?: boolean
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  site,
  siteSlug,
  isEditing = false,
}) => {
  const config: CookieConsentData = site?.settings?.cookie_consent || {
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
    policy_content:
      '<h3>1. Veri Sorumlusu</h3><p>6698 sayılı KVKK uyarınca kişisel verileriniz tarafımızca işlenmektedir.</p>',
  }

  const isEnabled = config.enabled !== false
  const storageKey = `oae_cookie_consent_${siteSlug}`

  const [hasConsented, setHasConsented] = useState<boolean>(true)
  const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false)
  const [activeModalTab, setActiveModalTab] = useState<'categories' | 'policy'>('categories')

  // Categories choices
  const [categories, setCategories] = useState({
    necessary: true,
    analytics: config.categories?.analytics?.enabled ?? true,
    marketing: config.categories?.marketing?.enabled ?? false,
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        setHasConsented(true)
        const parsed = JSON.parse(saved)
        if (parsed.categories) {
          setCategories({
            necessary: true,
            analytics: Boolean(parsed.categories.analytics),
            marketing: Boolean(parsed.categories.marketing),
          })
        }
      } else {
        // If not in editor mode or if editor URL has consent=0, show banner
        setHasConsented(false)
      }
    } catch {
      setHasConsented(false)
    }
  }, [storageKey])

  if (!isEnabled) return null

  const saveConsent = (acceptedCategories: { necessary: boolean; analytics: boolean; marketing: boolean }) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          accepted: true,
          timestamp: new Date().toISOString(),
          categories: acceptedCategories,
        })
      )
    } catch {
      // Ignore storage errors
    }
    setCategories(acceptedCategories)
    setHasConsented(true)
    setShowPreferencesModal(false)
  }

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true })
  }

  const handleRejectNonEssential = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false })
  }

  const handleSaveCustom = () => {
    saveConsent({
      necessary: true,
      analytics: categories.analytics,
      marketing: categories.marketing,
    })
  }

  const positionClass =
    config.position === 'bottom-left'
      ? 'fixed bottom-4 left-4 z-50 max-w-md w-full'
      : config.position === 'bottom-right'
      ? 'fixed bottom-4 right-4 z-50 max-w-md w-full'
      : 'fixed bottom-0 inset-x-0 z-50 w-full'

  return (
    <>
      {/* 1. Cookie Banner (Appears if user hasn't made a choice yet) */}
      {!hasConsented && (
        <div
          className={`${positionClass} animate-fade-in p-4 sm:p-5`}
          style={{ pointerEvents: 'auto' }}
        >
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/80 text-white rounded-3xl shadow-2xl p-5 sm:p-6 transition-all">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              {/* Message */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍪</span>
                  <h4 className="font-bold text-sm sm:text-base text-white">
                    {config.title || 'Çerez ve Gizlilik Tercihleriniz'}
                  </h4>
                  {isEditing && (
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded-full border border-purple-400/30">
                      Önizleme
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-4xl">
                  {config.message ||
                    'Sitemizde kullanıcı deneyimini iyileştirmek ve analizler gerçekleştirmek için çerezler kullanılmaktadır.'}
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModalTab('policy')
                      setShowPreferencesModal(true)
                    }}
                    className="text-xs text-purple-300 hover:text-purple-200 underline font-medium transition"
                  >
                    KVKK Aydınlatma Metni ve Çerez Politikasını Oku ↗
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalTab('categories')
                    setShowPreferencesModal(true)
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 transition"
                >
                  {config.settings_text || 'Tercihleri Özelleştir'}
                </button>
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-4 py-2 rounded-xl bg-gray-700/80 hover:bg-gray-600 text-white text-xs font-semibold transition"
                >
                  {config.reject_text || 'Sadece Zorunlular'}
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition transform hover:scale-105"
                >
                  {config.accept_all_text || 'Tümünü Kabul Et'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Discrete Floating Badge (To Reopen Settings Anytime) */}
      {hasConsented && config.badge_enabled !== false && !isEditing && (
        <button
          type="button"
          onClick={() => {
            setActiveModalTab('categories')
            setShowPreferencesModal(true)
          }}
          className="fixed bottom-4 left-4 z-40 bg-gray-900/90 hover:bg-gray-800 text-gray-300 hover:text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md border border-gray-700 transition flex items-center gap-1.5 group"
          title="Çerez ve Gizlilik Ayarlarını Değiştir"
        >
          <span className="text-sm group-hover:rotate-12 transition-transform">🍪</span>
          <span className="text-[11px] font-medium">{config.badge_text || 'Çerez Ayarları'}</span>
        </button>
      )}

      {/* 3. Detailed Preferences & KVKK Policy Modal */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden text-gray-800">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🍪</span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">
                    {config.policy_modal_title || 'Çerez Tercihleri ve KVKK Politikası'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Hangi verilerin ve çerezlerin işleneceğini belirleyin.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferencesModal(false)}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 pt-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveModalTab('categories')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeModalTab === 'categories'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <span>⚙️</span> Çerez Tercihleri
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('policy')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeModalTab === 'policy'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <span>📜</span> KVKK Aydınlatma Metni
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeModalTab === 'categories' ? (
                <div className="space-y-4">
                  {/* Category 1: Zorunlu Çerezler */}
                  <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                          {config.categories?.necessary?.name || 'Zorunlu Çerezler'}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Her Zaman Aktif
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {config.categories?.necessary?.desc ||
                          'Web sitesinin temel işlevleri, oturum yönetimi ve güvenlik için zorunludur.'}
                      </p>
                    </div>
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={true}
                        className="w-5 h-5 text-purple-600 rounded cursor-not-allowed opacity-70"
                      />
                    </div>
                  </div>

                  {/* Category 2: Analitik Çerezler */}
                  <div className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-purple-300 transition flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                          {config.categories?.analytics?.name || 'Analitik & İstatistik Çerezleri'}
                        </span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                          İsteğe Bağlı
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {config.categories?.analytics?.desc ||
                          'Sayfa ziyaret sayılarını, popüler içerikleri ve sitede geçirilen süreyi anonim olarak ölçer.'}
                      </p>
                    </div>
                    <div className="pt-1">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categories.analytics}
                          onChange={(e) =>
                            setCategories({ ...categories, analytics: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Category 3: Pazarlama Çerezleri */}
                  <div className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-purple-300 transition flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                          {config.categories?.marketing?.name || 'Pazarlama & Sosyal Medya'}
                        </span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                          İsteğe Bağlı
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {config.categories?.marketing?.desc ||
                          'İlgi alanlarınıza uygun kişiselleştirilmiş içerik ve hedefli duyurular sunulmasını sağlar.'}
                      </p>
                    </div>
                    <div className="pt-1">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categories.marketing}
                          onChange={(e) =>
                            setCategories({ ...categories, marketing: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
                  {config.policy_content ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: config.policy_content }}
                      className="text-xs sm:text-sm"
                    />
                  ) : (
                    <p className="text-gray-500 text-xs">Aydınlatma metni henüz eklenmemiş.</p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition"
              >
                Sadece Zorunluları Seç
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition"
                >
                  Tümünü Kabul Et
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition"
                >
                  Tercihlerimi Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
