import React, { useState } from 'react'

interface ImporterTabProps {
  siteSlug: string
  token: string
  userRole: string
  onImportSuccess?: () => void
}

export const ImporterTab: React.FC<ImporterTabProps> = ({
  siteSlug,
  token,
  userRole,
  onImportSuccess,
}) => {
  const [importMode, setImportMode] = useState<'file' | 'db'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [dbName, setDbName] = useState('')
  const [prefix, setPrefix] = useState('wp_')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (importMode === 'file' && !file) {
      setError('Lütfen bir .sql veya .zip dosyası seçin.')
      return
    }

    if (importMode === 'db' && !dbName) {
      setError('Lütfen veritabanı adını girin.')
      return
    }

    const formData = new FormData()
    formData.append('prefix', prefix)

    if (importMode === 'file' && file) {
      formData.append('dump_file', file)
    } else {
      formData.append('wp_db', dbName)
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/v1/admin/sites/${siteSlug}/import-wordpress`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'İçe aktarma başarısız oldu.')
      }

      setResult(data.stats)
      if (onImportSuccess) onImportSuccess()
    } catch (err: any) {
      setError(err.message || 'İçe aktarma sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (userRole !== 'admin') {
    return (
      <div className="p-8 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-center text-sm">
        ⚠️ WordPress İçe Aktarıcı yalnızca <strong>Admin</strong> yetkisine sahip kullanıcılar tarafından çalıştırılabilir.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">
          WordPress & Elementor İçe Aktarıcı (Importer)
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Mevcut bir WordPress sitesini tüm sayfaları, Elementor düzenleri, yazıları, formları ve menüleriyle tek tıkla OpenAppEngine motoruna dönüştürün.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
          ❌ {error}
        </div>
      )}

      {/* Success Summary */}
      {result && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <h3 className="font-bold text-base sm:text-lg">
              WordPress Başarıyla İçe Aktarıldı!
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-emerald-100">
              <span className="text-xl font-black text-emerald-600 block">{result.pages}</span>
              <span className="text-xs text-gray-600 font-semibold">Sayfa</span>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-emerald-100">
              <span className="text-xl font-black text-emerald-600 block">{result.posts}</span>
              <span className="text-xs text-gray-600 font-semibold">Yazı / Blog</span>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-emerald-100">
              <span className="text-xl font-black text-emerald-600 block">{result.forms}</span>
              <span className="text-xs text-gray-600 font-semibold">Form</span>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-emerald-100">
              <span className="text-xl font-black text-emerald-600 block">{result.menus}</span>
              <span className="text-xs text-gray-600 font-semibold">Menü</span>
            </div>
          </div>

          <p className="text-xs text-emerald-800">
            Sayfalar sekmesinden veya görsel editörden dönüştürülen sayfaları hemen görüntüleyebilir ve düzenleyebilirsiniz.
          </p>
        </div>
      )}

      {/* Import Form Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Method Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setImportMode('file')}
            className={`flex-1 py-2.5 rounded-xl transition ${
              importMode === 'file'
                ? 'bg-white shadow text-purple-700 font-bold'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            📁 Dosya Yükle (.sql veya .zip)
          </button>
          <button
            type="button"
            onClick={() => setImportMode('db')}
            className={`flex-1 py-2.5 rounded-xl transition ${
              importMode === 'db'
                ? 'bg-white shadow text-purple-700 font-bold'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            🗄️ Veritabanı Adı ile İçe Aktar
          </button>
        </div>

        <form onSubmit={handleImport} className="space-y-4 text-xs sm:text-sm">
          {importMode === 'file' ? (
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                WordPress SQL veya Zip Dosyası *
              </label>
              <div className="border-2 border-dashed border-gray-300 hover:border-purple-500 rounded-2xl p-6 text-center bg-gray-50/50 cursor-pointer transition">
                <input
                  type="file"
                  id="wp_file_input"
                  accept=".sql,.zip"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="wp_file_input" className="cursor-pointer block space-y-2">
                  <span className="text-3xl block">📦</span>
                  <span className="text-purple-600 font-bold text-sm block">
                    {file ? file.name : 'Dosya Seçmek İçin Tıklayın'}
                  </span>
                  <span className="text-gray-400 text-xs block">
                    {file
                      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB seçildi`
                      : 'phpMyAdmin çıktısı (.sql) veya sıkıştırılmış arşiv (.zip)'}
                  </span>
                </label>
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                WordPress Veritabanı Adı *
              </label>
              <input
                type="text"
                placeholder="örn: wp_berilzorlu veya eski_site_db"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none text-sm font-mono"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                MySQL/MariaDB sunucusunda bulunan içe aktarılmış veritabanı adı.
              </span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Tablo Ön Eki (Table Prefix)
            </label>
            <input
              type="text"
              placeholder="wp_"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none font-mono text-sm max-w-xs"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              WordPress wp-config.php içindeki $table_prefix değeri (varsayılan: <code>wp_</code>).
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Dönüştürülüyor ve İçe Aktarılıyor...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>İçe Aktarmayı Başlat</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
