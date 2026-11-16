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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">Formlar & Gelen Kutusu</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Ziyaretçilerinizden ve öğrencilerden gelen tüm başvuruları ve iletişim mesajlarını inceleyin.
        </p>
      </div>

      {/* Forms overview badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {forms.map((f) => (
          <div key={f.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-gray-900 line-clamp-1">{f.name}</div>
              <div className="text-xs text-gray-400 font-mono">slug: {f.slug}</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
              {f.submissions_count || 0} ileti
            </span>
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

                <div className="flex items-center gap-3 text-right self-end sm:self-auto">
                  <span className="text-[11px] text-gray-400 font-mono">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

            <button
              onClick={() => setSelectedSub(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-xs sm:text-sm"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
