import React, { useEffect, useState } from 'react'

interface SettingsTabProps {
  siteSlug: string
  token: string
  userRole: string
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ siteSlug, token, userRole }) => {
  const [smtp, setSmtp] = useState({
    host: '',
    port: '587',
    username: '',
    password: '',
    encryption: 'tls',
    from_address: '',
    from_name: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        const res = await fetch(`/api/v1/admin/sites/${siteSlug}/email-settings`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success && data.settings) {
          setSmtp((prev) => ({ ...prev, ...data.settings }))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [siteSlug])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setSuccessMsg(null)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/email-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ smtp }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMsg('✅ E-posta ve SMTP ayarları başarıyla kaydedildi.')
        setTimeout(() => setSuccessMsg(null), 3500)
      }
    } catch (e) {
      alert('Ayarlar kaydedilemedi.')
    } finally {
      setSaving(false)
    }
  }

  if (userRole !== 'admin') {
    return (
      <div className="p-8 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-center text-sm">
        ⚠️ E-posta ve SMTP sunucu ayarları yalnızca <strong>Admin</strong> yetkisine sahip kullanıcılar tarafından görüntülenebilir ve değiştirilebilir.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">E-Posta & SMTP Ayarları</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Ziyaretçileriniz iletişim formunu doldurduğunda bildirimlerin size ulaşması için SMTP sunucu bilgilerinizi tanımlayın.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {loading ? (
          <div className="p-6 text-center text-xs text-gray-400">Ayarlar yükleniyor...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">SMTP Sunucu Adresi (Host) *</label>
                <input
                  type="text"
                  required
                  placeholder="mail.domaininiz.com veya smtp.gmail.com"
                  value={smtp.host}
                  onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Port</label>
                <input
                  type="text"
                  required
                  placeholder="587"
                  value={smtp.port}
                  onChange={(e) => setSmtp({ ...smtp, port: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Kullanıcı Adı / E-Posta *</label>
                <input
                  type="text"
                  required
                  placeholder="info@domaininiz.com"
                  value={smtp.username}
                  onChange={(e) => setSmtp({ ...smtp, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Şifre *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={smtp.password}
                  onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Gönderen Adı</label>
                <input
                  type="text"
                  placeholder="Beril Zorlu Web Sitesi"
                  value={smtp.from_name}
                  onChange={(e) => setSmtp({ ...smtp, from_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Şifreleme Türü</label>
                <select
                  value={smtp.encryption}
                  onChange={(e) => setSmtp({ ...smtp, encryption: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none"
                >
                  <option value="tls">TLS (Önerilen - Port 587)</option>
                  <option value="ssl">SSL (Port 465)</option>
                  <option value="none">Şifrelemesiz</option>
                </select>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow transition disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
