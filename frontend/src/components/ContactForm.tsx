import React, { useState } from 'react'

export interface FormFieldOption {
  value: string
  label: string
}

export interface FormField {
  id: string
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | string
  label?: string
  placeholder?: string
  required?: boolean
  width?: number // 50 for 2-column inline, 100 for full row
  options?: (string | FormFieldOption)[]
  defaultValue?: string
}

export interface ContactFormProps {
  siteSlug: string
  title?: string
  subtitle?: string
  buttonText?: string
  buttonBgColor?: string
  buttonTextColor?: string
  buttonShape?: 'pill' | 'rounded' | 'square'
  cardStyle?: 'minimal' | 'boxed' | 'transparent'
  fields?: FormField[]
  formId?: string
}

export const ContactForm: React.FC<ContactFormProps> = ({
  siteSlug,
  title,
  subtitle,
  buttonText = 'Envoyer ma demande →',
  buttonBgColor = '#222222',
  buttonTextColor = '#ffffff',
  buttonShape = 'pill',
  cardStyle = 'transparent',
  fields = [],
  formId = 'contact-studio',
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

    const targetFormSlug = formId || 'contact-studio'

    try {
      const res = await fetch(`/api/v1/sites/${siteSlug}/forms/${targetFormSlug}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Le message n\'a pas pu être envoyé. Veuillez réessayer.')
      }
      setSubmitted(true)
      setFormData({})
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const wrapperClass =
    cardStyle === 'transparent'
      ? 'w-full bg-transparent p-0'
      : cardStyle === 'minimal'
      ? 'w-full bg-white/70 backdrop-blur-md rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-sm'
      : 'w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8'

  const shapeClass =
    buttonShape === 'pill'
      ? 'rounded-full'
      : buttonShape === 'rounded'
      ? 'rounded-xl'
      : 'rounded-none'

  return (
    <div className={wrapperClass}>
      {title && <h3 className="text-2xl font-normal text-gray-900 mb-2 font-serif">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mb-6">{subtitle}</p>}

      {submitted ? (
        <div className="bg-[#FAF7F2] border border-[#E8E2D9] text-[#222222] rounded-2xl p-8 text-center space-y-3">
          <div className="text-3xl">✨</div>
          <h4 className="font-serif text-xl font-normal text-[#222222]">Message bien envoyé</h4>
          <p className="text-sm text-[#555555] max-w-md mx-auto leading-relaxed">
            Merci de nous avoir contactés. Nous revenons vers vous sous 24 à 48 heures ouvrées pour échanger sur votre projet.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 inline-block text-xs uppercase tracking-widest font-semibold text-[#9E2123] underline hover:opacity-80"
          >
            Envoyer une autre demande
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-sm border border-red-200">
              {error}
            </div>
          )}

          {hasCustomFields ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => {
                if (field.type === 'recaptcha_v3') return null

                const colSpanClass = field.width === 50 ? 'md:col-span-1' : 'md:col-span-2'

                // 1. Textarea
                if (field.type === 'textarea') {
                  return (
                    <div key={field.id} className={colSpanClass}>
                      {field.label && (
                        <label className="block text-xs uppercase tracking-wider font-medium text-gray-600 mb-1.5">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                      )}
                      <textarea
                        required={field.required}
                        rows={3}
                        placeholder={field.placeholder || ''}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#DCD6CD] bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#222222] focus:ring-1 focus:ring-[#222222] outline-none transition text-sm resize-y"
                      />
                    </div>
                  )
                }

                // 2. Select dropdown
                if (field.type === 'select') {
                  return (
                    <div key={field.id} className={colSpanClass}>
                      {field.label && (
                        <label className="block text-xs uppercase tracking-wider font-medium text-gray-600 mb-1.5">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                      )}
                      <div className="relative">
                        <select
                          required={field.required}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-[#DCD6CD] bg-white text-gray-900 focus:border-[#222222] focus:ring-1 focus:ring-[#222222] outline-none transition text-sm appearance-none cursor-pointer"
                        >
                          {field.placeholder && <option value="">{field.placeholder}</option>}
                          {field.options?.map((opt, i) => {
                            const val = typeof opt === 'string' ? opt : opt.value
                            const lbl = typeof opt === 'string' ? opt : opt.label
                            return (
                              <option key={i} value={val}>
                                {lbl}
                              </option>
                            )
                          })}
                        </select>
                        <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-gray-400 text-xs">
                          ▼
                        </div>
                      </div>
                    </div>
                  )
                }

                // 3. Single Consent Checkbox (KVKK / RGPD)
                if (field.type === 'checkbox' && (!field.options || field.options.length <= 1)) {
                  return (
                    <div key={field.id} className="md:col-span-2 pt-1">
                      <label className="flex items-start gap-3 cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          required={field.required}
                          checked={!!formData[field.id]}
                          onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                          className="mt-0.5 rounded border-[#C4BEB5] text-[#222222] focus:ring-[#222222] h-4 w-4 cursor-pointer"
                        />
                        <span className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-700 transition">
                          {field.label || field.placeholder} {field.required && <span className="text-red-500">*</span>}
                        </span>
                      </label>
                    </div>
                  )
                }

                // 4. Standard text/email/tel/number inputs
                return (
                  <div key={field.id} className={colSpanClass}>
                    {field.label && (
                      <label className="block text-xs uppercase tracking-wider font-medium text-gray-600 mb-1.5">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                    )}
                    <input
                      type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'number' ? 'number' : 'text'}
                      required={field.required}
                      placeholder={field.placeholder || ''}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#DCD6CD] bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#222222] focus:ring-1 focus:ring-[#222222] outline-none transition text-sm"
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            // Default fallback simple form
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-gray-600 mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#DCD6CD] text-sm outline-none focus:border-[#222222]"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-gray-600 mb-1">E-mail *</label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#DCD6CD] text-sm outline-none focus:border-[#222222]"
                  placeholder="contact@exemple.com"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-gray-600 mb-1">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message || ''}
                  onChange={(e) => handleFieldChange('message', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#DCD6CD] text-sm outline-none focus:border-[#222222]"
                  placeholder="Parlez-nous de votre projet..."
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
              className={`w-full py-4 px-8 ${shapeClass} font-semibold text-sm tracking-wider uppercase transition-all duration-300 hover:opacity-90 active:scale-[0.99] shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <span>{buttonText}</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
