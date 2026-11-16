import React, { useEffect, useState } from 'react'

interface SettingsTabProps {
  siteSlug: string
  token: string
  userRole: string
}

interface SiteUserItem {
  id: number
  name: string
  user_code: string
  email: string
  role: string
  is_super_admin: boolean
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ siteSlug, token, userRole }) => {
  const [subTab, setSubTab] = useState<'general' | 'smtp' | 'team'>('general')

  // General Settings State
  const [general, setGeneral] = useState({
    name: '',
    domain: '',
    description: '',
    primary_color: '#4F46E5',
    logo_url: '',
    seo_title: '',
    seo_description: '',
    phone: '',
    email: '',
    address: '',
  })
  const [generalLoading, setGeneralLoading] = useState(true)
  const [generalSaving, setGeneralSaving] = useState(false)

  // SMTP Settings State
  const [smtp, setSmtp] = useState({
    host: '',
    port: '587',
    username: '',
    password: '',
    encryption: 'tls',
    from_address: '',
    from_name: '',
  })
  const [smtpLoading, setSmtpLoading] = useState(true)
  const [smtpSaving, setSmtpSaving] = useState(false)
  const [testingSmtp, setTestingSmtp] = useState(false)

  // Team / Users State
  const [teamUsers, setTeamUsers] = useState<SiteUserItem[]>([])
  const [teamLoading, setTeamLoading] = useState(false)
  const [newTeamUser, setNewTeamUser] = useState({
    user_code: '',
    name: '',
    role: 'editor',
    password: '',
  })
  const [addingUser, setAddingUser] = useState(false)

  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3500)
  }

  // Load General Settings
  const loadGeneralSettings = async () => {
    try {
      setGeneralLoading(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/general-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.site) {
        setGeneral({
          name: data.site.name || '',
          domain: data.site.domain || '',
          description: data.site.description || '',
          primary_color: data.site.primary_color || '#4F46E5',
          logo_url: data.site.logo_url || '',
          seo_title: data.site.seo_title || '',
          seo_description: data.site.seo_description || '',
          phone: data.site.phone || '',
          email: data.site.email || '',
          address: data.site.address || '',
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setGeneralLoading(false)
    }
  }

  // Load SMTP Settings
  const loadSmtpSettings = async () => {
    try {
      setSmtpLoading(true)
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
      setSmtpLoading(false)
    }
  }

  // Load Team Users
  const loadTeamUsers = async () => {
    try {
      setTeamLoading(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.users) {
        setTeamUsers(data.users)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setTeamLoading(false)
    }
  }

  useEffect(() => {
    loadGeneralSettings()
    loadSmtpSettings()
    loadTeamUsers()
  }, [siteSlug])

  // Save General Settings
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setGeneralSaving(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/general-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(general),
      })
      const data = await res.json()
      if (data.success) {
        showSuccess('✅ Site genel ayarları başarıyla güncellendi.')
      } else {
        alert(data.message || 'Hata oluştu.')
      }
    } catch (e) {
      alert('Ayarlar kaydedilemedi.')
    } finally {
      setGeneralSaving(false)
    }
  }

  // Save SMTP Settings
  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSmtpSaving(true)
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
        showSuccess('✅ E-posta ve SMTP ayarları kaydedildi.')
      }
    } catch (e) {
      alert('Kaydedilemedi.')
    } finally {
      setSmtpSaving(false)
    }
  }

  // Test SMTP Connection
  const handleTestSmtp = async () => {
    try {
      setTestingSmtp(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/email-settings/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipient: smtp.from_address || smtp.username }),
      })
      const data = await res.json()
      if (data.success) {
        showSuccess('✅ ' + data.message)
      } else {
        alert(data.message || 'SMTP Testi başarısız oldu.')
      }
    } catch (e: any) {
      alert('SMTP Testi sırasında hata oluştu: ' + (e.message || ''))
    } finally {
      setTestingSmtp(false)
    }
  }

  // Add Team User
  const handleAddTeamUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamUser.user_code) return

    try {
      setAddingUser(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTeamUser),
      })
      const data = await res.json()
      if (data.success) {
        showSuccess(data.message)
        setNewTeamUser({ user_code: '', name: '', role: 'editor', password: '' })
        loadTeamUsers()
      } else {
        alert(data.message || 'Kullanıcı eklenemedi.')
      }
    } catch (e) {
      alert('İşlem başarısız.')
    } finally {
      setAddingUser(false)
    }
  }

  // Remove Team User
  const handleRemoveTeamUser = async (userId: number, name: string) => {
    if (!confirm(`"${name}" kullanıcısının bu sitedeki yetkisini kaldırmak istiyor musunuz?`)) return

    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        showSuccess('Kullanıcı yetkisi kaldırıldı.')
        loadTeamUsers()
      }
    } catch (e) {
      alert('Silinemedi.')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Site Yönetimi & Ayarlar</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Bu sitenin kimlik bilgilerini, marka renklerini, e-posta bildirimlerini ve yetkili kullanıcı ekibini yönetin.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
          {successMsg}
        </div>
      )}

      {/* Sub Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setSubTab('general')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
            subTab === 'general'
              ? 'bg-purple-600 text-white shadow'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          🌐 Site Kimliği & Genel
        </button>
        <button
          onClick={() => setSubTab('smtp')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
            subTab === 'smtp'
              ? 'bg-purple-600 text-white shadow'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          ✉️ E-Posta / SMTP
        </button>
        <button
          onClick={() => setSubTab('team')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
            subTab === 'team'
              ? 'bg-purple-600 text-white shadow'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          👥 Site Ekibi & Roller ({teamUsers.length})
        </button>
      </div>

      {/* 1. GENERAL SETTINGS TAB */}
      {subTab === 'general' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          {generalLoading ? (
            <div className="p-6 text-center text-xs text-gray-400">Yükleniyor...</div>
          ) : (
            <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Site Adı *</label>
                  <input
                    type="text"
                    required
                    value={general.name}
                    onChange={(e) => setGeneral({ ...general, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Alan Adı (Domain)</label>
                  <input
                    type="text"
                    disabled
                    value={general.domain}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Slogan / Açıklama</label>
                <textarea
                  rows={2}
                  value={general.description}
                  onChange={(e) => setGeneral({ ...general, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Logo URL</label>
                  <input
                    type="text"
                    placeholder="https://.../logo.png"
                    value={general.logo_url}
                    onChange={(e) => setGeneral({ ...general, logo_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
                  />
                  {general.logo_url && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-gray-100 flex items-center gap-2">
                      <img src={general.logo_url} alt="Logo" className="max-h-8 object-contain" />
                      <span className="text-[11px] text-gray-400">Önizleme</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Marka / Tema Rengi</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={general.primary_color}
                      onChange={(e) => setGeneral({ ...general, primary_color: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 p-1"
                    />
                    <input
                      type="text"
                      value={general.primary_color}
                      onChange={(e) => setGeneral({ ...general, primary_color: e.target.value })}
                      className="w-32 px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <h3 className="font-bold text-gray-800 text-sm">SEO & Arama Motoru Ayarları</h3>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Varsayılan SEO Başlığı</label>
                  <input
                    type="text"
                    placeholder="Site Adı | Slogan"
                    value={general.seo_title}
                    onChange={(e) => setGeneral({ ...general, seo_title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Varsayılan Meta Açıklaması</label>
                  <textarea
                    rows={2}
                    placeholder="Arama sonuçlarında görünecek açıklama..."
                    value={general.seo_description}
                    onChange={(e) => setGeneral({ ...general, seo_description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <h3 className="font-bold text-gray-800 text-sm">İletişim Bilgileri (Formlar & Footer İçin)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Telefon</label>
                    <input
                      type="text"
                      placeholder="+90 (212) ..."
                      value={general.phone}
                      onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">İletişim E-Postası</label>
                    <input
                      type="email"
                      placeholder="iletisim@domain.com"
                      value={general.email}
                      onChange={(e) => setGeneral({ ...general, email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Adres</label>
                  <input
                    type="text"
                    placeholder="Fiziksel açık adres..."
                    value={general.address}
                    onChange={(e) => setGeneral({ ...general, address: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              {userRole === 'admin' ? (
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={generalSaving}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow transition disabled:opacity-50"
                  >
                    {generalSaving ? 'Kaydediliyor...' : 'Site Ayarlarını Kaydet 💾'}
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs">
                  ⚠️ Bu ayarları güncellemek için Site Admin yetkisi gerekmektedir.
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* 2. SMTP TAB */}
      {subTab === 'smtp' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          {smtpLoading ? (
            <div className="p-6 text-center text-xs text-gray-400">Ayarlar yükleniyor...</div>
          ) : (
            <form onSubmit={handleSaveSmtp} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">SMTP Sunucu Adresi (Host) *</label>
                  <input
                    type="text"
                    required
                    placeholder="mail.alanadiniz.com veya smtp.gmail.com"
                    value={smtp.host}
                    onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Port</label>
                  <input
                    type="text"
                    value={smtp.port}
                    onChange={(e) => setSmtp({ ...smtp, port: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Kullanıcı Adı / E-Posta *</label>
                  <input
                    type="text"
                    required
                    value={smtp.username}
                    onChange={(e) => setSmtp({ ...smtp, username: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Parola *</label>
                  <input
                    type="password"
                    value={smtp.password}
                    onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Gönderen E-Posta Adresi *</label>
                  <input
                    type="email"
                    required
                    value={smtp.from_address}
                    onChange={(e) => setSmtp({ ...smtp, from_address: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Güvenlik (Şifreleme)</label>
                  <select
                    value={smtp.encryption}
                    onChange={(e) => setSmtp({ ...smtp, encryption: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">Yok (Düz Metin)</option>
                  </select>
                </div>
              </div>

              {userRole === 'admin' ? (
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleTestSmtp}
                    disabled={testingSmtp || !smtp.host}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold shadow transition disabled:opacity-50 flex items-center gap-1.5 text-xs sm:text-sm"
                  >
                    <span>{testingSmtp ? '⏳' : '🧪'}</span>
                    <span>{testingSmtp ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={smtpSaving}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow transition disabled:opacity-50"
                  >
                    {smtpSaving ? 'Kaydediliyor...' : 'SMTP Ayarlarını Kaydet 💾'}
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs">
                  ⚠️ SMTP ayarlarını yalnızca Site Admin değiştirebilir.
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* 3. SITE TEAM / USERS TAB */}
      {subTab === 'team' && (
        <div className="space-y-6">
          {/* Add User to this Site Box */}
          {userRole === 'admin' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Bu Siteye Yetkili Kullanıcı / Editör Ekle</h3>
              <form onSubmit={handleAddTeamUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Kullanıcı Kodu / E-posta *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: editor_ahmet"
                    value={newTeamUser.user_code}
                    onChange={(e) => setNewTeamUser({ ...newTeamUser, user_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Ad Soyad (Yeni ise)</label>
                  <input
                    type="text"
                    placeholder="Örn: Ahmet Yılmaz"
                    value={newTeamUser.name}
                    onChange={(e) => setNewTeamUser({ ...newTeamUser, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Rol</label>
                  <select
                    value={newTeamUser.role}
                    onChange={(e) => setNewTeamUser({ ...newTeamUser, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  >
                    <option value="editor">Site Editörü (İçerik Yönetimi)</option>
                    <option value="admin">Site Yöneticisi (Tam Yetki)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={addingUser}
                    className="w-full py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition"
                  >
                    {addingUser ? '...' : '+ Kullanıcı Ekle'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List Users */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Siteye Atanmış Kullanıcılar</h3>
              <span className="text-xs text-gray-400">{teamUsers.length} kişi yetkili</span>
            </div>

            {teamLoading ? (
              <div className="p-6 text-center text-xs text-gray-400">Kullanıcılar yükleniyor...</div>
            ) : teamUsers.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">Henüz kullanıcı bulunmuyor.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {teamUsers.map((u) => (
                  <div key={u.id} className="p-4 sm:p-5 flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          <span>{u.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {u.role === 'admin' ? 'Site Yöneticisi' : 'Editör'}
                          </span>
                          {u.is_super_admin && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                              Super Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Kullanıcı Kodu: <span className="font-mono text-gray-600">{u.user_code}</span> • {u.email}
                        </div>
                      </div>
                    </div>

                    {userRole === 'admin' && !u.is_super_admin && (
                      <button
                        onClick={() => handleRemoveTeamUser(u.id, u.name)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition"
                      >
                        Yetkiyi Kaldır
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
