import React, { useEffect, useState, useMemo } from 'react'

interface FormsTabProps {
  siteSlug: string
  token: string
}

const STATUS_CONFIG: Record<string, { label: string; badge: string; border: string; bg: string; icon: string }> = {
  new: { label: 'Yeni Alındı', badge: 'bg-blue-100 text-blue-800', border: 'border-blue-200', bg: 'bg-blue-50/50', icon: '🆕' },
  in_review: { label: 'İnceleniyor', badge: 'bg-amber-100 text-amber-800', border: 'border-amber-200', bg: 'bg-amber-50/50', icon: '🔍' },
  approved: { label: 'Onaylandı', badge: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-200', bg: 'bg-emerald-50/50', icon: '✅' },
  rejected: { label: 'Reddedildi', badge: 'bg-rose-100 text-rose-800', border: 'border-rose-200', bg: 'bg-rose-50/50', icon: '❌' },
  completed: { label: 'Tamamlandı', badge: 'bg-purple-100 text-purple-800', border: 'border-purple-200', bg: 'bg-purple-50/50', icon: '📁' },
}

export const FormsTab: React.FC<FormsTabProps> = ({ siteSlug, token }) => {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSub, setSelectedSub] = useState<any | null>(null)

  // DataTable Filtering & Search State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFormFilter, setSelectedFormFilter] = useState<string>('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all')
  const [sortField] = useState<'date' | 'name'>('date')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  // Workflow Modal / Status Update State
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [newAdminNote, setNewAdminNote] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  // Form Create/Edit Modal State
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingForm, setEditingForm] = useState<any | null>(null)
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [savingForm, setSavingForm] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [formsRes, subsRes] = await Promise.all([
        fetch(`/api/v1/admin/sites/${siteSlug}/forms`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/v1/admin/sites/${siteSlug}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const formsData = await formsRes.json()
      const subsData = await subsRes.json()

      if (formsData.success) setForms(formsData.forms || [])
      if (subsData.success) setSubmissions(subsData.submissions?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [siteSlug])

  // Filtered & Sorted Submissions for DataTable
  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((sub) => {
        // Form Filter
        if (selectedFormFilter !== 'all' && String(sub.form_id) !== selectedFormFilter) {
          return false
        }
        // Status Filter
        if (selectedStatusFilter !== 'all' && (sub.status || 'new') !== selectedStatusFilter) {
          return false
        }
        // Search Filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase()
          const dataStr = JSON.stringify(sub.data || {}).toLowerCase()
          const tokenStr = (sub.tracking_token || '').toLowerCase()
          const formNameStr = (sub.form?.name || '').toLowerCase()
          return dataStr.includes(q) || tokenStr.includes(q) || formNameStr.includes(q)
        }
        return true
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const tA = new Date(a.created_at).getTime()
          const tB = new Date(b.created_at).getTime()
          return sortOrder === 'desc' ? tB - tA : tA - tB
        } else {
          const nA = (a.data?.name || a.data?.ad_soyad || '').toLowerCase()
          const nB = (b.data?.name || b.data?.ad_soyad || '').toLowerCase()
          return sortOrder === 'desc' ? nB.localeCompare(nA) : nA.localeCompare(nB)
        }
      })
  }, [submissions, selectedFormFilter, selectedStatusFilter, searchTerm, sortField, sortOrder])

  // Status & Note Update in Workflow
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedSub) return
    try {
      setStatusUpdating(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/submissions/${selectedSub.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          note: newAdminNote.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (data.success && data.submission) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === selectedSub.id ? { ...s, ...data.submission } : s))
        )
        setSelectedSub(data.submission)
        setNewAdminNote('')
        showToast(`✅ Durum güncellendi: ${STATUS_CONFIG[newStatus]?.label || newStatus}`)
      } else {
        alert(data.message || 'Durum güncellenemedi.')
      }
    } catch (e: any) {
      alert(e.message || 'Hata oluştu.')
    } finally {
      setStatusUpdating(false)
    }
  }

  // Toggle is_public tracking
  const handleTogglePublic = async (currentVal: boolean) => {
    if (!selectedSub) return
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/submissions/${selectedSub.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: selectedSub.status || 'new',
          is_public: !currentVal,
          note: !currentVal ? 'Genel takip bağlantısı açıldı.' : 'Genel takip bağlantısı kapatıldı.',
        }),
      })
      const data = await res.json()
      if (data.success && data.submission) {
        setSelectedSub(data.submission)
        setSubmissions((prev) =>
          prev.map((s) => (s.id === selectedSub.id ? { ...s, ...data.submission } : s))
        )
        showToast(!currentVal ? '🔗 Takip bağlantısı herkese açıldı.' : '🔒 Takip bağlantısı gizlendi.')
      }
    } catch (e) {
      alert('Ayar güncellenemedi.')
    }
  }

  // Export to CSV
  const handleExportCsv = async () => {
    try {
      setExporting(true)
      const queryParam = selectedFormFilter !== 'all' ? `?form_id=${selectedFormFilter}` : ''
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/submissions/export${queryParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Dışa aktarma başarısız oldu.')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `basvurular_${siteSlug}_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      showToast('📥 Excel uyumlu CSV dosyası indirildi!')
    } catch (e: any) {
      alert(e.message || 'Dışa aktarılamadı.')
    } finally {
      setExporting(false)
    }
  }

  // Copy tracking link
  const handleCopyLink = (tokenStr?: string) => {
    const t = tokenStr || selectedSub?.tracking_token
    if (!t) return
    const url = `${window.location.origin}/?site=${siteSlug}&track=${t}`
    navigator.clipboard.writeText(url)
    showToast('📋 Benzersiz takip bağlantısı kopyalandı!')
  }

  // Delete submission
  const handleDeleteSubmission = async (subId: number) => {
    if (!confirm('Bu başvuruyu silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/submissions/${subId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setSubmissions((prev) => prev.filter((s) => s.id !== subId))
        if (selectedSub?.id === subId) setSelectedSub(null)
        showToast('🗑️ Başvuru silindi.')
      }
    } catch (e) {
      alert('İleti silinemedi.')
    }
  }

  // Form Modal actions
  const openCreateForm = () => {
    setEditingForm(null)
    setFormName('')
    setFormSlug('')
    setRecipientEmail('')
    setShowFormModal(true)
  }

  const openEditForm = (f: any) => {
    setEditingForm(f)
    setFormName(f.name || '')
    setFormSlug(f.slug || '')
    setRecipientEmail(f.settings?.recipient_email || '')
    setShowFormModal(true)
  }

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    try {
      setSavingForm(true)
      const url = editingForm
        ? `/api/v1/admin/sites/${siteSlug}/forms/${editingForm.id}`
        : `/api/v1/admin/sites/${siteSlug}/forms`
      const method = editingForm ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName.trim(),
          slug: formSlug.trim() || undefined,
          recipient_email: recipientEmail.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowFormModal(false)
        fetchData()
        showToast('✅ Form başarıyla kaydedildi!')
      }
    } catch (e) {
      alert('Form kaydedilemedi.')
    } finally {
      setSavingForm(false)
    }
  }

  const handleDeleteForm = async (formId: number) => {
    if (!confirm('Bu formu ve bağlı tüm iletileri silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/forms/${formId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        fetchData()
        showToast('🗑️ Form silindi.')
      }
    } catch (e) {
      alert('Form silinemedi.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold animate-fade-in flex items-center gap-2 border border-gray-700">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Veri Seti, Formlar & Akış Yönetimi</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Kayıt setlerini inceleyin, durum akışlarını yönetin ve dışa aktarın.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={exporting || submissions.length === 0}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow flex items-center gap-1.5 transition cursor-pointer"
            title="Excel uyumlu UTF-8 CSV olarak indir"
          >
            <span>📊</span>
            <span>{exporting ? 'İndiriliyor...' : 'Excel / CSV İndir'}</span>
          </button>

          <button
            onClick={openCreateForm}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>＋</span>
            <span>Yeni Form Oluştur</span>
          </button>
        </div>
      </div>

      {/* Form Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {forms.map((f) => (
          <div
            key={f.id}
            className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-sm text-gray-900 truncate">{f.name}</div>
                <div className="text-xs text-gray-400 font-mono truncate">kod: {f.slug}</div>
                {f.settings?.recipient_email && (
                  <div className="text-[11px] text-emerald-700 mt-1 truncate">
                    📧 {f.settings.recipient_email}
                  </div>
                )}
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold shrink-0">
                {submissions.filter((s) => s.form_id === f.id).length} kayıt
              </span>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-gray-50">
              <button
                type="button"
                onClick={() => openEditForm(f)}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold cursor-pointer"
              >
                ⚙️ Ayarlar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteForm(f.id)}
                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-semibold cursor-pointer"
              >
                🗑️ Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modern DataTable Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {/* DataTable Filter Controls Bar */}
        <div className="p-4 bg-gray-50/70 border-b border-gray-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Search Bar */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Ad, e-posta, telefon, takip kodu veya içerik ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-purple-600 outline-none text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right: Filters & Sorters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Form Filter */}
            <select
              value={selectedFormFilter}
              onChange={(e) => setSelectedFormFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white font-medium text-gray-700 outline-none cursor-pointer"
            >
              <option value="all">📂 Tüm Formlar ({submissions.length})</option>
              {forms.map((f) => (
                <option key={f.id} value={String(f.id)}>
                  {f.name} ({submissions.filter((s) => s.form_id === f.id).length})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white font-medium text-gray-700 outline-none cursor-pointer"
            >
              <option value="all">🏷️ Tüm Durumlar</option>
              {Object.entries(STATUS_CONFIG).map(([stKey, conf]) => (
                <option key={stKey} value={stKey}>
                  {conf.icon} {conf.label} ({submissions.filter((s) => (s.status || 'new') === stKey).length})
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              title="Tarih Sıralamasını Değiştir"
            >
              Tarih {sortOrder === 'desc' ? '⬇️ Yeni' : '⬆️ Eski'}
            </button>
          </div>
        </div>

        {/* DataTable Table View */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Veriler yükleniyor...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            Eşleşen başvuru veya form iletisi bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/70 border-b border-gray-200 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Takip Kodu & Tarih</th>
                  <th className="py-3 px-4">Başvuran / İletişim</th>
                  <th className="py-3 px-4">Form</th>
                  <th className="py-3 px-4">Durum (Akış)</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubmissions.map((sub) => {
                  const data = sub.data || {}
                  const name = data.name || data.ad_soyad || data.fullname || 'İsimsiz'
                  const email = data.email || data.eposta || ''
                  const phone = data.phone || data.tel || data.telefon || ''
                  const statusKey = sub.status || 'new'
                  const statusConf = STATUS_CONFIG[statusKey] || STATUS_CONFIG.new

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className="hover:bg-purple-50/40 transition cursor-pointer group"
                    >
                      {/* Takip Kodu & Tarih */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-purple-700 text-[11px] flex items-center gap-1.5">
                          <span>{sub.tracking_token || `sub_${sub.id}`}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyLink(sub.tracking_token)
                            }}
                            title="Takip Bağlantısını Kopyala"
                            className="text-gray-400 hover:text-purple-600 p-0.5 rounded cursor-pointer"
                          >
                            📋
                          </button>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5 font-sans">
                          {new Date(sub.created_at).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Başvuran / İletişim */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 text-sm group-hover:text-purple-700 transition">
                          {name}
                        </div>
                        <div className="text-gray-500 text-[11px] mt-0.5">
                          {email && <span>{email} </span>}
                          {phone && <span className="font-mono">• Tel: {phone}</span>}
                        </div>
                      </td>

                      {/* Form */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold text-[11px] border border-gray-200">
                          {sub.form?.name || 'Form'}
                        </span>
                      </td>

                      {/* Durum / Akış Rozeti */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs border ${statusConf.badge} ${statusConf.border}`}
                        >
                          <span>{statusConf.icon}</span>
                          <span>{statusConf.label}</span>
                        </span>
                      </td>

                      {/* İşlemler */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedSub(sub)
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition cursor-pointer"
                          >
                            👁️ İncele & Akış
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSubmission(sub.id)
                            }}
                            className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3 bg-gray-50 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-500">
          <span>Toplam {filteredSubmissions.length} kayıt gösteriliyor</span>
          <span>Tablo satırına tıklayarak tüm başvuru detaylarını ve akışı görebilirsiniz</span>
        </div>
      </div>

      {/* Row Inspection & Workflow Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="p-5 bg-gray-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base sm:text-lg">
                      {selectedSub.data?.name || selectedSub.data?.ad_soyad || 'Başvuru Detayı'}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        STATUS_CONFIG[selectedSub.status || 'new']?.badge || 'bg-gray-100'
                      }`}
                    >
                      {STATUS_CONFIG[selectedSub.status || 'new']?.label || selectedSub.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">
                    Form: {selectedSub.form?.name} • Kod: {selectedSub.tracking_token}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedSub(null)}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
              {/* Left Column: Form Submission Data */}
              <div className="space-y-4">
                <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5 border-b pb-2">
                  <span>📄</span>
                  <span>Gönderilen Başvuru Bilgileri</span>
                </div>

                <div className="space-y-2.5 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  {Object.entries(selectedSub.data || {}).map(([key, value]) => (
                    <div key={key} className="flex flex-col border-b border-gray-200/50 pb-2 last:border-none last:pb-0">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                        {key}
                      </span>
                      <span className="text-gray-900 font-medium text-xs break-words mt-0.5">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '-')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tracking Link Card */}
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 text-xs flex items-center gap-1">
                      <span>🔗</span>
                      <span>Özel Takip & İnceleme Bağlantısı</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTogglePublic(selectedSub.is_public)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                        selectedSub.is_public
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {selectedSub.is_public ? '✓ Herkese Açık' : '🔒 Gizli / Kilitli'}
                    </button>
                  </div>

                  <p className="text-[11px] text-purple-700 leading-relaxed">
                    Bu bağlantıyı başvuru sahibine veya jüri/komisyona göndererek sisteme giriş yapmadan incelemesini sağlayabilirsiniz.
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/?site=${siteSlug}&track=${selectedSub.tracking_token}`}
                      className="flex-1 px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-[11px] font-mono text-gray-700 outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyLink()}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
                    >
                      Kopyala
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 font-mono">
                  IP Adresi: {selectedSub.ip_address || 'Kayıtlı değil'} • Tarih: {new Date(selectedSub.created_at).toLocaleString('tr-TR')}
                </div>
              </div>

              {/* Right Column: Workflow Pipeline & Audit History */}
              <div className="space-y-4">
                <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5 border-b pb-2">
                  <span>🔄</span>
                  <span>Akış & Durum Yönetimi</span>
                </div>

                {/* Status Switcher Buttons */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide block">
                    Durumu Güncelle:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(STATUS_CONFIG).map(([stKey, conf]) => {
                      const isActive = (selectedSub.status || 'new') === stKey
                      return (
                        <button
                          key={stKey}
                          type="button"
                          disabled={statusUpdating || isActive}
                          onClick={() => handleUpdateStatus(stKey)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:cursor-not-allowed ${
                            isActive
                              ? `${conf.badge} ${conf.border} ring-2 ring-purple-600`
                              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <span>{conf.icon}</span>
                          <span>{conf.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Admin Note Box */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide block">
                    Yönetici Notu Ekle:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Bu durum değişikliği veya başvuru için dahili not girin..."
                    value={newAdminNote}
                    onChange={(e) => setNewAdminNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none text-xs"
                  />
                </div>

                {/* Workflow Audit Timeline */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide block">
                    Akış Tarihçesi (Audit Log):
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(selectedSub.history || []).length === 0 ? (
                      <div className="text-gray-400 text-xs italic">Kayıtlı durum geçmişi bulunmuyor.</div>
                    ) : (
                      (selectedSub.history || []).map((h: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-gray-50 border border-gray-200/70 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-800">
                              {STATUS_CONFIG[h.status]?.icon} {h.label || h.status}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {h.changed_at ? new Date(h.changed_at).toLocaleString('tr-TR') : ''}
                            </span>
                          </div>
                          {h.note && <div className="text-gray-600 text-[11px] leading-relaxed">{h.note}</div>}
                          <div className="text-[10px] text-purple-700 font-semibold">
                            İşlem Yapan: {h.changed_by || 'Yönetici'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteSubmission(selectedSub.id)}
                className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition cursor-pointer"
              >
                🗑️ Başvuruyu Sil
              </button>

              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs transition cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Create / Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingForm ? 'Form Ayarlarını Düzenle' : 'Yeni İletişim Formu Oluştur'}
            </h3>
            <form onSubmit={handleSaveForm} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Form Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ön Kayıt Başvuru Formu"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Form Kodu (Slug)</label>
                <input
                  type="text"
                  placeholder="Örn: on-kayit-formu"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Bildirim Alıcı E-Posta Adresi (SMTP ile gönderilir)
                </label>
                <input
                  type="email"
                  placeholder="Örn: info@domain.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={savingForm}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow disabled:opacity-50"
                >
                  {savingForm ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
