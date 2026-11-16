import React, { useState } from 'react'

interface AdminLoginProps {
  onLoginSuccess: (token: string, user: any) => void
  onCancel: () => void
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Giriş yapılamadı.')
      }

      localStorage.setItem('openappengine_token', data.token)
      localStorage.setItem('openappengine_user', JSON.stringify(data.user))
      onLoginSuccess(data.token, data.user)
    } catch (err: any) {
      setError(err.message || 'Giriş sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-purple-950 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg mb-3">
            <span className="text-2xl font-black">⚡</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            OpenAppEngine
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Yönetim Paneline Giriş Yapın
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Demo Credentials Hint */}
        <div className="mb-6 p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-[11px] sm:text-xs text-purple-900 leading-relaxed">
          <p className="font-bold mb-1">Varsayılan Giriş Bilgileri:</p>
          <div className="flex justify-between">
            <span>👑 <strong>Admin:</strong> Kod: <code>admin</code></span>
            <span>Şifre: <code>admin123</code></span>
          </div>
          <div className="flex justify-between mt-1">
            <span>✏️ <strong>Editör:</strong> Kod: <code>editor</code></span>
            <span>Şifre: <code>editor123</code></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Kullanıcı Kodu veya E-Posta
            </label>
            <input
              type="text"
              required
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="örn: admin veya admin@openappengine.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Parola
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none text-sm transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold text-sm shadow-lg hover:shadow-xl active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Doğrulanıyor...' : 'Giriş Yap'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-800 font-medium transition"
          >
            ← Siteye Geri Dön
          </button>
        </form>
      </div>
    </div>
  )
}
