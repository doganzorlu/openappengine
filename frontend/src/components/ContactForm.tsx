import React, { useState } from 'react'

interface ContactFormProps {
  siteSlug: string
  title?: string
}

export const ContactForm: React.FC<ContactFormProps> = ({ siteSlug, title = 'İletişim Formu' }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/v1/sites/${siteSlug}/forms/simple-contact-form/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Mesaj iletilemedi.')
      setSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-xl mx-auto my-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{title}</h3>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-6 text-center space-y-2">
          <div className="text-3xl">✨</div>
          <h4 className="font-bold text-lg">Teşekkür Ederiz!</h4>
          <p className="text-sm">Bizimle iletişime geçtiğiniz için teşekkür ederiz. En kısa zamanda size dönüş yapacağız.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 text-xs font-semibold text-green-700 underline"
          >
            Yeni mesaj gönder
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">İsim *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="Adınız ve Soyadınız"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">E-Posta *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="ornek@domain.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mesajınız *</label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="Mesajınızı buraya yazın..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-lg text-white font-bold bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-800 hover:to-pink-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </form>
      )}
    </div>
  )
}
