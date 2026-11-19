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

  // Form Create/Edit Modal State (No-Code Form Designer)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingForm, setEditingForm] = useState<any | null>(null)
  const [modalTab, setModalTab] = useState<'fields' | 'styling' | 'workflow'>('fields')
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [formFields, setFormFields] = useState<any[]>([])
  const [buttonText, setButtonText] = useState('Gönder')
  const [buttonBg, setButtonBg] = useState('#222222')
  const [buttonShape, setButtonShape] = useState<'pill' | 'rounded' | 'square'>('pill')
  const [cardStyle, setCardStyle] = useState<'transparent' | 'minimal' | 'boxed'>('transparent')
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false)
  const [autoReplySubject, setAutoReplySubject] = useState('')
  const [autoReplyMessage, setAutoReplyMessage] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [savingForm, setSavingForm] = useState(false)

  const handleAddField = () => {
    const newField = {
      id: 'field_' + Math.random().toString(36).substring(2, 8),
      type: 'text',
      label: 'Yeni Alan',
      placeholder: '',
      required: false,
      width: 100,
      options: '',
    }
    setFormFields([...formFields, newField])
  }

  const handleUpdateField = (index: number, key: string, value: any) => {
    const updated = [...formFields]
    updated[index] = { ...updated[index], [key]: value }
    setFormFields(updated)
  }

  const handleRemoveField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index))
  }

  const handleMoveField = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= formFields.length) return
    const updated = [...formFields]
    const temp = updated[index]
    updated[index] = updated[target]
    updated[target] = temp
    setFormFields(updated)
  }

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
    setModalTab('fields')
    setFormFields([
      { id: 'name', type: 'text', label: 'Adınız Soyadınız', placeholder: 'Ad Soyad', required: true, width: 100 },
      { id: 'email', type: 'email', label: 'E-Posta', placeholder: 'ornek@domain.com', required: true, width: 100 },
      { id: 'message', type: 'textarea', label: 'Mesajınız', placeholder: 'Mesajınızı buraya yazın...', required: true, width: 100 },
    ])
    setButtonText('Gönder')
    setButtonBg('#222222')
    setButtonShape('pill')
    setCardStyle('transparent')
    setAutoReplyEnabled(false)
    setAutoReplySubject('')
    setAutoReplyMessage('')
    setWebhookUrl('')
    setShowFormModal(true)
  }

  const openEditForm = (f: any) => {
    setEditingForm(f)
    setFormName(f.name || '')
    setFormSlug(f.slug || '')
    const s = f.settings || {}
    setRecipientEmail(s.recipient_email || '')
    setModalTab('fields')
    
    // Normalize options if array
    const rawFields = Array.isArray(f.fields) && f.fields.length > 0 ? f.fields : [
      { id: 'name', type: 'text', label: 'Adınız Soyadınız', placeholder: 'Ad Soyad', required: true, width: 100 },
      { id: 'email', type: 'email', label: 'E-Posta', placeholder: 'ornek@domain.com', required: true, width: 100 },
      { id: 'message', type: 'textarea', label: 'Mesajınız', placeholder: 'Mesajınızı buraya yazın...', required: true, width: 100 },
    ]
    const normalizedFields = rawFields.map((field: any) => ({
      ...field,
      options: Array.isArray(field.options) ? field.options.join(', ') : (field.options || ''),
    }))
    setFormFields(normalizedFields)

    setButtonText(s.button_text || 'Gönder')
    setButtonBg(s.button_bg || '#222222')
    setButtonShape(s.button_shape || 'pill')
    setCardStyle(s.card_style || 'transparent')
    setAutoReplyEnabled(Boolean(s.auto_reply_enabled))
    setAutoReplySubject(s.auto_reply_subject || '')
    setAutoReplyMessage(s.auto_reply_message || '')
    setWebhookUrl(s.webhook_url || '')
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

      // Clean field options into array
      const cleanedFields = formFields.map((f: any) => {
        let optArray: string[] | undefined = undefined
        if (typeof f.options === 'string' && f.options.trim()) {
          optArray = f.options.split(',').map((s: string) => s.trim()).filter(Boolean)
        } else if (Array.isArray(f.options)) {
          optArray = f.options
        }
        return {
          id: f.id || ('field_' + Math.random().toString(36).substring(2, 7)),
          type: f.type || 'text',
          label: f.label || '',
          placeholder: f.placeholder || '',
          required: Boolean(f.required),
          width: Number(f.width) === 50 ? 50 : 100,
          options: optArray,
        }
      })

      const payload = {
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        fields: cleanedFields,
        recipient_email: recipientEmail.trim() || undefined,
        settings: {
          recipient_email: recipientEmail.trim() || undefined,
          button_text: buttonText,
          button_bg: buttonBg,
          button_shape: buttonShape,
          card_style: cardStyle,
          auto_reply_enabled: autoReplyEnabled,
          auto_reply_subject: autoReplySubject,
          auto_reply_message: autoReplyMessage,
          webhook_url: webhookUrl,
        },
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setShowFormModal(false)
        fetchData()
        showToast('✅ Form ve Akış Ayarları Başarıyla Kaydedildi!')
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

      {/* No-Code Form Designer & Workflow Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl flex flex-col max-w-3xl w-full max-h-[92vh] overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>🛠️</span>
                  <span>{editingForm ? 'No-Code Form Tasarımcısı & Akış Motoru' : 'Yeni No-Code Form Oluştur'}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Form alanlarını, buton stilini ve başvuru sonrası otomasyon akışlarını yapılandırın.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 px-6 bg-white gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setModalTab('fields')}
                className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                  modalTab === 'fields'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>📋</span>
                <span>Alanlar & Düzen ({formFields.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('styling')}
                className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                  modalTab === 'styling'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>🎨</span>
                <span>Tasarım & UI</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('workflow')}
                className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                  modalTab === 'workflow'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>⚡</span>
                <span>Akış & Otomasyon</span>
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs sm:text-sm">
              {/* Common Meta Details (Name & Slug) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200/70">
                <div>
                  <label className="block font-bold text-gray-700 text-xs mb-1">Form Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Studio İletişim Formu"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-purple-600 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 text-xs mb-1">Form Kodu (Slug) *</label>
                  <input
                    type="text"
                    placeholder="Örn: contact-studio"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-purple-600 outline-none font-mono text-xs"
                  />
                </div>
              </div>

              {/* TAB 1: FIELDS DESIGNER */}
              {modalTab === 'fields' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Form Alanları</h4>
                      <p className="text-[11px] text-gray-500">Alanları sırayla düzenleyin, genişliklerini ve veri tiplerini belirleyin.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                    >
                      <span>＋</span>
                      <span>Yeni Alan Ekle</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formFields.map((field, idx) => (
                      <div
                        key={field.id || idx}
                        className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-purple-300 transition shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-gray-800 text-xs">
                              {field.label || 'İsimsiz Alan'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-mono">
                              {field.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveField(idx, -1)}
                              className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs disabled:opacity-30"
                              title="Yukarı Taşı"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={idx === formFields.length - 1}
                              onClick={() => handleMoveField(idx, 1)}
                              className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs disabled:opacity-30"
                              title="Aşağı Taşı"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveField(idx)}
                              className="w-6 h-6 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs ml-1"
                              title="Alanı Sil"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Alan Tipi</label>
                            <select
                              value={field.type}
                              onChange={(e) => handleUpdateField(idx, 'type', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs"
                            >
                              <option value="text">Metin (Text)</option>
                              <option value="email">E-Posta (Email)</option>
                              <option value="tel">Telefon (Tel)</option>
                              <option value="number">Sayı (Number)</option>
                              <option value="textarea">Uzun Metin (Textarea)</option>
                              <option value="select">Açılır Kutu (Select)</option>
                              <option value="checkbox">Onay Kutusu (Checkbox / KVKK)</option>
                              <option value="radio">Radyo Düğmesi (Radio)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Etiket (Label)</label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs"
                              placeholder="Örn: Telefon Numarası"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">İpucu (Placeholder)</label>
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) => handleUpdateField(idx, 'placeholder', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs"
                              placeholder="Örn: +90 5..."
                            />
                          </div>

                          <div className="flex items-center gap-3 pt-4 sm:pt-5">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                              <input
                                type="checkbox"
                                checked={Boolean(field.required)}
                                onChange={(e) => handleUpdateField(idx, 'required', e.target.checked)}
                                className="rounded text-purple-600"
                              />
                              <span className="font-semibold text-gray-700">Zorunlu</span>
                            </label>

                            <select
                              value={field.width || 100}
                              onChange={(e) => handleUpdateField(idx, 'width', Number(e.target.value))}
                              className="px-2 py-1 rounded-lg border border-gray-300 text-[11px] bg-white font-medium"
                              title="Alan Genişliği"
                            >
                              <option value={100}>Tam Satır (%100)</option>
                              <option value={50}>Yan Yana (%50)</option>
                            </select>
                          </div>
                        </div>

                        {/* Options input for select/radio */}
                        {(field.type === 'select' || field.type === 'radio') && (
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                              Seçenekler (Virgülle ayırarak girin)
                            </label>
                            <input
                              type="text"
                              value={field.options || ''}
                              onChange={(e) => handleUpdateField(idx, 'options', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs font-mono"
                              placeholder="Örn: Lancement, Refonte, Danışmanlık"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: STYLING & UI */}
              {modalTab === 'styling' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-sm">Buton ve Form Görünüm Stili</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 text-xs mb-1">Gönder Buton Metni</label>
                      <input
                        type="text"
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                        placeholder="Örn: Envoyer ma demande →"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 text-xs mb-1">Buton Arka Plan Rengi</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={buttonBg}
                          onChange={(e) => setButtonBg(e.target.value)}
                          className="w-9 h-9 rounded-xl border border-gray-300 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={buttonBg}
                          onChange={(e) => setButtonBg(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 text-xs mb-1">Buton Şekli</label>
                      <select
                        value={buttonShape}
                        onChange={(e) => setButtonShape(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs"
                      >
                        <option value="pill">Tam Yuvarlak Hap (Pill - L'AGENCE Style)</option>
                        <option value="rounded">Hafif Yuvarlatılmış (Rounded-xl)</option>
                        <option value="square">Düz Köşeli (Square)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 text-xs mb-1">Kart Görünümü (Wrapper)</label>
                      <select
                        value={cardStyle}
                        onChange={(e) => setCardStyle(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs"
                      >
                        <option value="transparent">Şeffaf (Sayfa zeminine tam oturan zarif)</option>
                        <option value="minimal">Minimal (Hafif yarı saydam beyaz ve ince çerçeve)</option>
                        <option value="boxed">Kutu Kart (Beyaz zemin ve belirgin gölge)</option>
                      </select>
                    </div>
                  </div>

                  {/* Live Button Preview */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 mt-4 text-center space-y-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Canlı Buton Önizlemesi</span>
                    <button
                      type="button"
                      style={{ backgroundColor: buttonBg, color: '#ffffff' }}
                      className={`py-3 px-8 text-xs font-bold uppercase tracking-wider ${
                        buttonShape === 'pill' ? 'rounded-full' : buttonShape === 'rounded' ? 'rounded-xl' : 'rounded-none'
                      } shadow transition`}
                    >
                      {buttonText}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: WORKFLOW & NOTIFICATIONS */}
              {modalTab === 'workflow' && (
                <div className="space-y-5">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Kayıt Sonrası Akış & Otomasyonlar</h4>
                    <p className="text-[11px] text-gray-500">Form doldurulduğu anda tetiklenecek bildirimler ve entegrasyonlar.</p>
                  </div>

                  {/* 1. Admin Notification */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-gray-800 text-xs">
                      <span>📧</span>
                      <span>Yönetici Bildirim E-Postası (SMTP)</span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Gelen başvuruların tüm detayları bu adrese anında e-posta olarak iletilir.
                    </p>
                    <input
                      type="email"
                      placeholder="Örn: contact@lagencedesignstudio.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs"
                    />
                  </div>

                  {/* 2. Auto-responder to applicant */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-gray-800 text-xs">
                        <span>💌</span>
                        <span>Başvuru Sahibine Otomatik Yanıt (Auto-Responder)</span>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-purple-700">
                        <input
                          type="checkbox"
                          checked={autoReplyEnabled}
                          onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                          className="rounded text-purple-600"
                        />
                        <span>Aktif Et</span>
                      </label>
                    </div>

                    {autoReplyEnabled && (
                      <div className="space-y-2.5 pt-2 border-t border-gray-200/60">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">E-Posta Konusu</label>
                          <input
                            type="text"
                            placeholder="Talebinizi aldık - Teşekkür ederiz"
                            value={autoReplySubject}
                            onChange={(e) => setAutoReplySubject(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            E-Posta Metni (Kullanılabilir etiketler: <code className="text-purple-700">{"{{name}}"}</code>, <code className="text-purple-700">{"{{site}}"}</code>)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Merhaba {{name}}, projenizle ilgili talebiniz bize ulaştı..."
                            value={autoReplyMessage}
                            onChange={(e) => setAutoReplyMessage(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Outgoing Webhook */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-gray-800 text-xs">
                      <span>🌐</span>
                      <span>Dış Sistem Entegrasyonu (Webhook HTTP POST)</span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Zapier, Make, HubSpot veya CRM sisteminize form verilerini anlık JSON olarak aktarın.
                    </p>
                    <input
                      type="url"
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition text-xs"
                >
                  Vazgeç
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={savingForm}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow disabled:opacity-50 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>💾</span>
                    <span>{savingForm ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
