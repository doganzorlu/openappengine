import React, { useEffect, useState } from 'react'

interface FormsTabProps {
  siteSlug: string
  token: string
}

export const FormsTab: React.FC<FormsTabProps> = ({ siteSlug, token }) => {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSub, setSelectedSub] = useState<any | null>(null)

  // Form Create/Edit Modal State
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingForm, setEditingForm] = useState<any | null>(null)
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [savingForm, setSavingForm] = useState(false)

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
      }
    } catch (e) {
      alert('Form silinemedi.')
    }
  }

  const handleDeleteSubmission = async (subId: number) => {
    if (!confirm('Bu iletiyi silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/submissions/${subId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setSubmissions((prev) => prev.filter((s) => s.id !== subId))
        if (selectedSub?.id === subId) setSelectedSub(null)
      }
    } catch (e) {
      alert('İleti silinemedi.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Formlar & Gelen Kutusu</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            İletişim formlarını yapılandırın, bildirim alıcı e-postasını belirleyin ve gelen başvuruları inceleyin.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow flex items-center gap-2 self-start sm:self-auto transition"
        >
          <span>＋</span>
          <span>Yeni Form Oluştur</span>
        </button>
      </div>

      {/* Forms overview badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {forms.map((f) => (
          <div
            key={f.id}
            className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-sm text-gray-900 truncate">{f.name}</div>
                <div className="text-xs text-gray-400 font-mono truncate">slug: {f.slug}</div>
                {f.settings?.recipient_email && (
                  <div className="text-[11px] text-emerald-700 mt-1 truncate">
                    📧 {f.settings.recipient_email}
                  </div>
                )}
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold shrink-0">
                {f.submissions_count || 0} ileti
              </span>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-gray-50">
              <button
                type="button"
                onClick={() => openEditForm(f)}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold"
              >
                ⚙️ Ayarlar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteForm(f.id)}
                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-semibold"
              >
                🗑️ Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submissions Table / Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-800">Gelen Başvuru & Mesaj Listesi</h3>
          <span className="text-xs text-gray-500">Toplam: {submissions.length} ileti</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">İletiler yükleniyor...</div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Henüz gelen bir form iletisi bulunmuyor.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => setSelectedSub(sub)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-purple-50/30 cursor-pointer transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">
                      {sub.data?.name || sub.data?.ad_soyad || 'İsimsiz'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-semibold text-gray-600">
                      {sub.form?.name || 'Form'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {sub.data?.email || 'E-posta yok'} {sub.data?.phone && `• Tel: ${sub.data.phone}`}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right self-end sm:self-auto">
                  <span className="text-[11px] text-gray-400 font-mono mr-1">
                    {new Date(sub.created_at).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <button className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold">
                    İncele →
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSubmission(sub.id)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold"
                    title="İletiyi Sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                  placeholder="Örn: İletişim Formu"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Form Kodu (Slug)</label>
                <input
                  type="text"
                  placeholder="Örn: iletisim-formu"
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
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {savingForm ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-bold text-lg text-gray-900">İleti Detayları</h3>
              <button
                onClick={() => setSelectedSub(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block text-[11px]">Form Adı</span>
                <span className="font-bold text-gray-800">{selectedSub.form?.name}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block text-[11px]">Tarih / IP</span>
                <span className="text-gray-800">
                  {new Date(selectedSub.created_at).toLocaleString('tr-TR')} • IP: {selectedSub.ip_address || 'Gizli'}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                  Form Verileri:
                </h4>
                {Object.entries(selectedSub.data || {}).map(([key, val]) => (
                  <div key={key} className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                    <span className="text-gray-400 block text-[11px] font-mono uppercase">{key}</span>
                    <span className="text-gray-900 font-medium whitespace-pre-wrap">
                      {String(val || '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => handleDeleteSubmission(selectedSub.id)}
                className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs sm:text-sm"
              >
                🗑️ İletiyi Sil
              </button>
              <button
                onClick={() => setSelectedSub(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-xs sm:text-sm"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
