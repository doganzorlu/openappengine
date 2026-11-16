import React, { useState } from 'react'

interface FormField {
  id: string
  type: string
  label?: string
  placeholder?: string
  required?: boolean
  options?: string[]
}

interface ContactFormProps {
  siteSlug: string
  title?: string
  buttonText?: string
  fields?: FormField[]
  formId?: string
}

export const ContactForm: React.FC<ContactFormProps> = ({
  siteSlug,
  title = 'İletişim Formu',
  buttonText = 'Gönder',
  fields = [],
  formId,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasCustomFields = fields && fields.length > 0

  const handleFieldChange = (fieldId: string, val: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const targetFormSlug = formId || 'simple-contact-form'

    try {
      const res = await fetch(`/api/v1/sites/${siteSlug}/forms/${targetFormSlug}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Mesaj iletilemedi.')
      setSubmitted(true)
      setFormData({})
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
          <h4 className="font-bold text-lg">Başarıyla Gönderildi!</h4>
          <p className="text-sm">
            Bilgileriniz kaydedildi. En kısa zamanda sizinle iletişime geçeceğiz.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 text-xs font-semibold text-green-700 underline"
          >
            Yeni form doldur
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

          {hasCustomFields ? (
            fields.map((field) => {
              if (field.type === 'recaptcha_v3') return null

              if (field.type === 'textarea') {
                return (
                  <div key={field.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      {field.label} {field.required && '*'}
                    </label>
                    <textarea
                      required={field.required}
                      rows={3}
                      placeholder={field.placeholder || ''}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition text-sm"
                    />
                  </div>
                )
              }

              if (field.type === 'checkbox' && field.options && field.options.length > 0) {
                return (
                  <div key={field.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {field.label} {field.required && '*'}
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {field.options.map((opt, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 p-2 rounded border bg-gray-50 hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={!!formData[`${field.id}_${i}`]}
                            onChange={(e) =>
                              handleFieldChange(`${field.id}_${i}`, e.target.checked ? opt : null)
                            }
                            className="rounded text-purple-600"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              }

              if (field.type === 'radio' && field.options && field.options.length > 0) {
                return (
                  <div key={field.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {field.label} {field.required && '*'}
                    </label>
                    <div className="flex gap-4 text-xs">
                      {field.options.map((opt, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 p-2 rounded border bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={field.id}
                            value={opt}
                            checked={formData[field.id] === opt}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className="text-purple-600"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              }

              return (
                <div key={field.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {field.label} {field.required && '*'}
                  </label>
                  <input
                    type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'tel' ? 'tel' : 'text'}
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition text-sm"
                  />
                </div>
              )
            })
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">İsim *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
                  placeholder="Adınız ve Soyadınız"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-Posta *</label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
                  placeholder="ornek@domain.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mesajınız *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message || ''}
                  onChange={(e) => handleFieldChange('message', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-lg text-white font-bold bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-800 hover:to-pink-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Gönderiliyor...' : buttonText}
          </button>
        </form>
      )}
    </div>
  )
}
