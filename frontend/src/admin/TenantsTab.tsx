import React, { useState, useEffect } from 'react'

interface TenantUser {
  id: number
  name: string
  user_code: string
  email: string
  role: string
}

interface TenantItem {
  id: number
  name: string
  slug: string
  domain: string
  description?: string
  status: 'active' | 'draft' | 'archived'
  primary_color: string
  logo_url?: string
  pages_count: number
  posts_count: number
  forms_count: number
  users: TenantUser[]
  created_at: string
}

interface TenantsTabProps {
  token: string
  onSelectTenant: (slug: string) => void
  isSuperAdmin: boolean
}

export const TenantsTab: React.FC<TenantsTabProps> = ({
  token,
  onSelectTenant,
  isSuperAdmin,
}) => {
  const [tenants, setTenants] = useState<TenantItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all')

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    domain: '',
    description: '',
    primary_color: '#4F46E5',
    create_admin: true,
    admin_name: '',
    admin_user_code: '',
    admin_email: '',
    admin_password: '',
  })

  // Assign User Modal State
  const [assignUserModal, setAssignUserModal] = useState<{ open: boolean; tenantId: number | null; tenantName: string }>({
    open: false,
    tenantId: null,
    tenantName: '',
  })
  const [userForm, setUserForm] = useState({
    user_code: '',
    name: '',
    role: 'admin',
    password: '',
  })
  const [assignLoading, setAssignLoading] = useState(false)

  // Status message
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchTenants = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/admin/tenants', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.tenants) {
        setTenants(data.tenants)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text })
    setTimeout(() => setAlertMsg(null), 4500)
  }

  // Handle Create Tenant
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.name || !createForm.domain) {
      alert('Lütfen Tenant Adı ve Domain alanlarını doldurun.')
      return
    }

    try {
      setCreateLoading(true)
      const payload: any = {
        name: createForm.name,
        slug: createForm.slug || undefined,
        domain: createForm.domain,
        description: createForm.description,
        primary_color: createForm.primary_color,
      }

      if (createForm.create_admin && createForm.admin_user_code && createForm.admin_password) {
        payload.admin_name = createForm.admin_name
        payload.admin_user_code = createForm.admin_user_code
        payload.admin_email = createForm.admin_email
        payload.admin_password = createForm.admin_password
      }

      const res = await fetch('/api/v1/admin/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        showAlert('success', data.message || 'Tenant başarıyla oluşturuldu.')
        setIsCreateOpen(false)
        setCreateForm({
          name: '',
          slug: '',
          domain: '',
          description: '',
          primary_color: '#4F46E5',
          create_admin: true,
          admin_name: '',
          admin_user_code: '',
          admin_email: '',
          admin_password: '',
        })
        fetchTenants()
      } else {
        alert(data.message || 'Tenant oluşturulamadı.')
      }
    } catch (err: any) {
      alert(err.message || 'Hata oluştu.')
    } finally {
      setCreateLoading(false)
    }
  }

  // Handle Delete Tenant
  const handleDeleteTenant = async (id: number, name: string) => {
    if (!confirm(`"${name}" tenantını ve bu siteye bağlı tüm sayfaları, formları ve yazıları silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
      return
    }

    try {
      const res = await fetch(`/api/v1/admin/tenants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        showAlert('success', data.message)
        fetchTenants()
      } else {
        alert(data.message || 'Silinemedi.')
      }
    } catch (e) {
      alert('Silme işlemi başarısız.')
    }
  }

  // Handle Assign User Submit
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignUserModal.tenantId || !userForm.user_code) return

    try {
      setAssignLoading(true)
      const res = await fetch(`/api/v1/admin/tenants/${assignUserModal.tenantId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userForm),
      })
      const data = await res.json()
      if (data.success) {
        showAlert('success', data.message)
        setAssignUserModal({ open: false, tenantId: null, tenantName: '' })
        setUserForm({ user_code: '', name: '', role: 'admin', password: '' })
        fetchTenants()
      } else {
        alert(data.message || 'Kullanıcı atanamadı.')
      }
    } catch (e) {
      alert('İşlem başarısız.')
    } finally {
      setAssignLoading(false)
    }
  }

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.domain.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())

    if (statusFilter === 'all') return matchesSearch
    return matchesSearch && t.status === statusFilter
  })

  return (
    <div className="space-y-6">
      {/* Header and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>🏢</span> Tenantlar & Domain Yönetimi
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            OpenAppEngine üzerindeki bağımsız web sitelerini, özel domainleri ve tenant yöneticilerini tek merkezden yönetin.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition text-xs sm:text-sm self-start sm:self-auto"
          >
            <span>➕</span> Yeni Tenant Ekle
          </button>
        )}
      </div>

      {alertMsg && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg font-bold">
            🏢
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-gray-900">{tenants.length}</div>
            <div className="text-[11px] sm:text-xs text-gray-500 font-medium">Toplam Tenant</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
            🌐
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-gray-900">
              {tenants.filter((t) => t.status === 'active').length}
            </div>
            <div className="text-[11px] sm:text-xs text-gray-500 font-medium">Aktif Domain</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-bold">
            📄
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-gray-900">
              {tenants.reduce((acc, t) => acc + (t.pages_count || 0), 0)}
            </div>
            <div className="text-[11px] sm:text-xs text-gray-500 font-medium">Toplam Sayfa</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold">
            👥
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-gray-900">
              {tenants.reduce((acc, t) => acc + (t.users?.length || 0), 0)}
            </div>
            <div className="text-[11px] sm:text-xs text-gray-500 font-medium">Yetkili Yönetici</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Tenant adı, domain veya slug ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'active', 'draft', 'archived'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {st === 'all' ? 'Tümü' : st === 'active' ? 'Aktif' : st === 'draft' ? 'Taslak' : 'Arşiv'}
            </button>
          ))}
        </div>
      </div>

      {/* Tenant Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 text-sm">Tenant verileri yükleniyor...</div>
      ) : filteredTenants.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 text-gray-400 text-sm">
          Arama kriterine uygun tenant bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTenants.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group"
            >
              {/* Card Color Top Strip */}
              <div
                className="h-2.5 w-full"
                style={{ backgroundColor: t.primary_color || '#4F46E5' }}
              />

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                {/* Title & Domain */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-1">
                      {t.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        t.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'draft'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {t.status === 'active' ? 'Aktif' : t.status === 'draft' ? 'Taslak' : 'Arşiv'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-purple-600 font-medium">
                    <span>🌐</span>
                    <a
                      href={`https://${t.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline line-clamp-1"
                    >
                      {t.domain}
                    </a>
                  </div>

                  {t.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>

                {/* Metrics Badges */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-slate-50 rounded-2xl text-center text-xs">
                  <div>
                    <div className="font-extrabold text-gray-900">{t.pages_count}</div>
                    <div className="text-[10px] text-gray-400">Sayfa</div>
                  </div>
                  <div>
                    <div className="font-extrabold text-gray-900">{t.posts_count}</div>
                    <div className="text-[10px] text-gray-400">Yazı</div>
                  </div>
                  <div>
                    <div className="font-extrabold text-gray-900">{t.forms_count}</div>
                    <div className="text-[10px] text-gray-400">Form</div>
                  </div>
                </div>

                {/* Assigned Users / Admins */}
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Site Yöneticileri</span>
                    {isSuperAdmin && (
                      <button
                        onClick={() =>
                          setAssignUserModal({
                            open: true,
                            tenantId: t.id,
                            tenantName: t.name,
                          })
                        }
                        className="text-purple-600 hover:text-purple-700 text-[11px] font-bold"
                      >
                        + Yönetici Ata
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {t.users && t.users.length > 0 ? (
                      t.users.map((u) => (
                        <span
                          key={u.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-medium"
                        >
                          <span>👤</span>
                          <span className="font-semibold">{u.user_code}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-purple-200 text-purple-800 uppercase">
                            {u.role}
                          </span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">Yönetici atanmamış</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectTenant(t.slug)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:shadow transition"
                >
                  <span>⚙️</span> Bu Siteyi Yönet
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={`/?site=${t.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-gray-100 text-xs transition"
                    title="Önizle"
                  >
                    👁️
                  </a>

                  {isSuperAdmin && (
                    <button
                      onClick={() => handleDeleteTenant(t.id, t.name)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 text-xs transition"
                      title="Tenantı Sil"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE NEW TENANT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
                <span>🏢</span> Yeni Tenant / Site Ekle
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tenant / Kurum Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Akademi Otizm"
                    value={createForm.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setCreateForm((prev) => ({
                        ...prev,
                        name,
                        slug: prev.slug ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                      }))
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Kısa URL Kodu (Slug) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: akademi-otizm"
                    value={createForm.slug}
                    onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Alan Adı / Domain *
                  <span className="text-[11px] font-normal text-gray-400 ml-1">
                    (Plesk'te tanımlı veya yönlendirilecek domain)
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: akademi.otizm.org veya yenisite.com"
                  value={createForm.domain}
                  onChange={(e) => setCreateForm({ ...createForm, domain: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Site Açıklaması / Slogan</label>
                <textarea
                  rows={2}
                  placeholder="Sitenin amacı veya kısa açıklaması..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tema / Marka Ana Rengi</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={createForm.primary_color}
                    onChange={(e) => setCreateForm({ ...createForm, primary_color: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 p-1"
                  />
                  <input
                    type="text"
                    value={createForm.primary_color}
                    onChange={(e) => setCreateForm({ ...createForm, primary_color: e.target.value })}
                    className="w-32 px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono"
                  />
                  <div className="flex items-center gap-1.5">
                    {['#4F46E5', '#0077B6', '#10B981', '#E11D48', '#800080', '#0F172A'].map((col) => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setCreateForm({ ...createForm, primary_color: col })}
                        style={{ backgroundColor: col }}
                        className="w-6 h-6 rounded-full border border-white shadow-sm hover:scale-110 transition"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Dedicated Tenant Admin Creation Option */}
              <div className="pt-3 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-800 mb-3">
                  <input
                    type="checkbox"
                    checked={createForm.create_admin}
                    onChange={(e) => setCreateForm({ ...createForm, create_admin: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Bu Tenant İçin Özel Yönetici (Site Admin) Hesabı Oluştur</span>
                </label>

                {createForm.create_admin && (
                  <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Yönetici Adı Soyadı
                        </label>
                        <input
                          type="text"
                          placeholder="Örn: Ahmet Yılmaz"
                          value={createForm.admin_name}
                          onChange={(e) => setCreateForm({ ...createForm, admin_name: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Kullanıcı Kodu (Giriş Adı) *
                        </label>
                        <input
                          type="text"
                          placeholder="Örn: akademi_admin"
                          value={createForm.admin_user_code}
                          onChange={(e) => setCreateForm({ ...createForm, admin_user_code: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">E-Posta</label>
                        <input
                          type="email"
                          placeholder="admin@akademi.otizm.org"
                          value={createForm.admin_email}
                          onChange={(e) => setCreateForm({ ...createForm, admin_email: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Giriş Parolası *</label>
                        <input
                          type="password"
                          placeholder="Minimum 6 karakter"
                          value={createForm.admin_password}
                          onChange={(e) => setCreateForm({ ...createForm, admin_password: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5 shadow"
                >
                  {createLoading ? 'Oluşturuluyor...' : 'Tenantı Oluştur 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN USER MODAL */}
      {assignUserModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Yönetici / Editör Ata
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              <strong>{assignUserModal.tenantName}</strong> sitesine yetkili kullanıcı ekleyin.
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Kullanıcı Kodu / E-Posta *</label>
                <input
                  type="text"
                  required
                  placeholder="Kullanıcı kodu veya e-posta"
                  value={userForm.user_code}
                  onChange={(e) => setUserForm({ ...userForm, user_code: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Rol</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                >
                  <option value="admin">Site Yöneticisi (Admin - Tam Yetki)</option>
                  <option value="editor">Site Editörü (Editor - İçerik Düzenleme)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Parola (Kullanıcı yeni ise zorunlu)
                </label>
                <input
                  type="password"
                  placeholder="Mevcut kullanıcı ise boş bırakın"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setAssignUserModal({ open: false, tenantId: null, tenantName: '' })}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  {assignLoading ? '...' : 'Yetkilendir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
