import React, { useEffect, useState } from 'react'
import { MediaPickerModal, type MediaItem } from '../components/MediaPickerModal'

interface PopupTabProps {
  siteSlug: string
  token: string
}

interface PopupData {
  enabled: boolean
  title: string
  image_url: string
  description: string
  button_text: string
  button_url: string
  delay_seconds: number
  show_once: boolean
}

export const PopupTab: React.FC<PopupTabProps> = ({ siteSlug, token }) => {
  const [popup, setPopup] = useState<PopupData>({
    enabled: false,
    title: '',
    image_url: '',
    description: '',
    button_text: '',
    button_url: '',
    delay_seconds: 0,
    show_once: false,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [mediaPickerConfig, setMediaPickerConfig] = useState<{
    isOpen: boolean
    targetKey: 'image_url' | 'button_url'
    allowedTypes: 'all' | 'image' | 'document'
    title: string
  }>({
    isOpen: false,
    targetKey: 'image_url',
    allowedTypes: 'image',
    title: 'Afiş / Görsel Seç',
  })

  const fetchPopup = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/popup`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.popup) {
        setPopup({
          enabled: Boolean(data.popup.enabled),
          title: data.popup.title || '',
          image_url: data.popup.image_url || '',
          description: data.popup.description || '',
          button_text: data.popup.button_text || '',
          button_url: data.popup.button_url || '',
          delay_seconds: data.popup.delay_seconds || 0,
          show_once: Boolean(data.popup.show_once),
        })
      }
    } catch (e) {
      console.error('Popup yüklenemedi:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPopup()
  }, [siteSlug])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/popup`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(popup),
      })
      const data = await res.json()
      if (data.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        alert(data.message || 'Kaydedilemedi.')
      }
    } catch (e) {
      alert('Kaydedilirken bir hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  const handleMediaSelect = (media: MediaItem) => {
    setPopup((prev) => ({
      ...prev,
      [mediaPickerConfig.targetKey]: media.file_url,
    }))
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-3">
        <span className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <span>Popup ayarları yükleniyor...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Popup & Duyuru Oluşturucu</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Ziyaretçileriniz siteye girdiğinde açılan afiş, etkinlik duyurusu veya doküman indirme penceresi oluşturun.
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <span>✅</span> Popup ayarları başarıyla kaydedildi!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          {/* Active Switch */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50/60 border border-purple-100">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Popup Durumu</h4>
              <p className="text-xs text-gray-500">
                Açık olduğunda ziyaretçiler siteye girdiğinde popup gösterilir.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={popup.enabled}
                onChange={(e) => setPopup({ ...popup, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Afiş / Görsel URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700">Afiş / Görsel URL</label>
              <button
                type="button"
                onClick={() =>
                  setMediaPickerConfig({
                    isOpen: true,
                    targetKey: 'image_url',
                    allowedTypes: 'image',
                    title: 'Popup Afişi / Fotoğrafı Seç',
                  })
                }
                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1.5"
              >
                <span>🖼️</span> Medya Kütüphanesinden Seç
              </button>
            </div>
            <input
              type="text"
              value={popup.image_url}
              onChange={(e) => setPopup({ ...popup, image_url: e.target.value })}
              placeholder="/storage/sites/.../afis.jpg veya https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Başlık (Opsiyonel) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Başlık <span className="text-gray-400 font-normal">(Opsiyonel)</span>
            </label>
            <input
              type="text"
              value={popup.title}
              onChange={(e) => setPopup({ ...popup, title: e.target.value })}
              placeholder="Örn: VI. Otizm ve Müzik Yaz Okulu 2026 Başlıyor!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Açıklama Metni (Opsiyonel) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Açıklama Metni <span className="text-gray-400 font-normal">(Opsiyonel)</span>
            </label>
            <textarea
              rows={3}
              value={popup.description}
              onChange={(e) => setPopup({ ...popup, description: e.target.value })}
              placeholder="Duyuru hakkında kısa bir özet veya bilgilendirme metni..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Buton Ayarları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Aksiyon Butonu Metni</label>
              <input
                type="text"
                value={popup.button_text}
                onChange={(e) => setPopup({ ...popup, button_text: e.target.value })}
                placeholder="Örn: Etkinlik Bilgileri & Başvuru"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700">Hedef Bağlantı (URL)</label>
                <button
                  type="button"
                  onClick={() =>
                    setMediaPickerConfig({
                      isOpen: true,
                      targetKey: 'button_url',
                      allowedTypes: 'all',
                      title: 'Hedef Belge / PDF Seç',
                    })
                  }
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  <span>📄</span> PDF / Belge
                </button>
              </div>
              <input
                type="text"
                value={popup.button_url}
                onChange={(e) => setPopup({ ...popup, button_url: e.target.value })}
                placeholder="Örn: /?site=...&post=... veya PDF linki"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          {/* Gösterim Kuralları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Görünme Gecikmesi</label>
              <select
                value={popup.delay_seconds}
                onChange={(e) => setPopup({ ...popup, delay_seconds: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none bg-white"
              >
                <option value={0}>Hemen aç (0 saniye)</option>
                <option value={1}>1 saniye sonra</option>
                <option value={2}>2 saniye sonra</option>
                <option value={3}>3 saniye sonra</option>
                <option value={5}>5 saniye sonra</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Gösterim Sıklığı</label>
              <select
                value={popup.show_once ? 'once' : 'always'}
                onChange={(e) => setPopup({ ...popup, show_once: e.target.value === 'once' })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none bg-white"
              >
                <option value="always">Her sayfa ziyaretinde göster</option>
                <option value="once">Oturum başına yalnızca 1 kez göster</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <span>{saving ? '⏳' : '💾'}</span>
              <span>{saving ? 'Kaydediliyor...' : 'Popup Ayarlarını Kaydet'}</span>
            </button>
          </div>
        </form>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-gray-900 text-white px-4 py-2.5 rounded-t-2xl text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>Canlı Önizleme (Live Preview)</span>
            </div>
            <span className="text-[10px] text-gray-400">
              {popup.enabled ? '🟢 Sitede Aktif' : '⚪ Pasif'}
            </span>
          </div>

          <div className="bg-black/60 rounded-b-2xl p-6 min-h-[460px] flex items-center justify-center border border-gray-800 shadow-2xl backdrop-blur-xs relative overflow-hidden">
            <div className="bg-white rounded-xl shadow-2xl max-w-[380px] w-full p-4 relative flex flex-col items-center animate-zoom-in">
              {/* Close Icon Preview */}
              <button
                type="button"
                className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/90 shadow text-gray-600 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>

              {popup.image_url ? (
                <img
                  src={popup.image_url}
                  alt={popup.title || 'Popup Afiş'}
                  className="w-full h-auto max-h-[50vh] object-contain rounded-lg shadow-xs"
                />
              ) : (
                <div className="w-full aspect-[4/3] rounded-lg bg-gray-100 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                  <span className="text-3xl mb-1">🖼️</span>
                  <span className="text-xs font-medium">Afiş veya görsel seçilmedi</span>
                </div>
              )}

              {popup.title && (
                <h4 className="mt-3 font-extrabold text-gray-900 text-sm text-center">
                  {popup.title}
                </h4>
              )}

              {popup.description && (
                <p className="mt-1 text-xs text-gray-600 text-center leading-relaxed">
                  {popup.description}
                </p>
              )}

              {popup.button_text && (
                <div className="mt-3 w-full">
                  <button
                    type="button"
                    className="w-full py-2 px-4 rounded-lg bg-[#333333] text-white text-xs font-semibold shadow hover:bg-black transition text-center"
                  >
                    {popup.button_text}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Universal Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerConfig.isOpen}
        onClose={() => setMediaPickerConfig((prev) => ({ ...prev, isOpen: false }))}
        onSelect={handleMediaSelect}
        siteSlug={siteSlug}
        token={token}
        allowedTypes={mediaPickerConfig.allowedTypes}
        title={mediaPickerConfig.title}
      />
    </div>
  )
}
