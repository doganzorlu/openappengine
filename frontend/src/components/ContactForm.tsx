import React, { useState, useEffect, useMemo } from 'react'

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
  inputStyle?: 'underline' | 'boxed' | 'minimal'
  displayMode?: 'inline' | 'multistep' | 'modal'
  modalTriggerText?: string
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
  inputStyle = 'underline',
  displayMode = 'inline',
  modalTriggerText = 'Bize Ulaşın / Teklif Alın →',
  fields = [],
  formId = 'contact-studio',
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Global listener for opening form modal via anchors or custom events
  useEffect(() => {
    const handleOpenModal = (e: any) => {
      const targetForm = e.detail?.formId
      if (!targetForm || targetForm === formId) {
        setIsModalOpen(true)
      }
    }
    window.addEventListener('open-form-modal', handleOpenModal)
    return () => window.removeEventListener('open-form-modal', handleOpenModal)
  }, [formId])

  const hasCustomFields = fields && fields.length > 0

  // Multi-step grouping (chunk fields into logical steps: ~3 fields per step or by step property)
  const steps = useMemo(() => {
    if (!hasCustomFields) return []
    const chunks: FormField[][] = []
    let currentChunk: FormField[] = []
    
    fields.forEach((field, idx) => {
      currentChunk.push(field)
      // Group when 2 full-width or 3-4 mixed fields accumulate, or on textarea
      if (currentChunk.length >= 3 || field.type === 'textarea' || idx === fields.length - 1) {
        chunks.push(currentChunk)
        currentChunk = []
      }
    })
    if (currentChunk.length > 0) chunks.push(currentChunk)
    return chunks.length > 0 ? chunks : [fields]
  }, [fields, hasCustomFields])

  const isMultiStepMode = displayMode === 'multistep' && steps.length > 1
  const isLastStep = !isMultiStepMode || currentStep === steps.length - 1

  const handleFieldChange = (fieldId: string, val: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: val }))
  }

  const validateCurrentStep = () => {
    if (!isMultiStepMode) return true
    const currentFields = steps[currentStep] || []
    for (const f of currentFields) {
      if (f.required && (formData[f.id] === undefined || formData[f.id] === '' || formData[f.id] === false)) {
        setError(`Veuillez renseigner le champ obligatoire : "${f.label || f.id}"`)
        return false
      }
    }
    setError(null)
    return true
  }

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault()
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handlePrevStep = (e: React.MouseEvent) => {
    e.preventDefault()
    setError(null)
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCurrentStep()) return

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
      setCurrentStep(0)
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

  // Determine input classes based on inputStyle prop
  const inputClass =
    inputStyle === 'underline'
      ? 'w-full px-0 py-2.5 bg-transparent border-0 border-b border-[#222222]/40 rounded-none text-[#222222] placeholder:text-[#222222]/35 focus:border-b-[#222222] focus:ring-0 outline-none transition-colors text-xs font-light'
      : inputStyle === 'minimal'
      ? 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200/90 bg-white/60 text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition text-xs'
      : 'w-full px-4 py-3 rounded-xl border border-[#DCD6CD] bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#222222] focus:ring-1 focus:ring-[#222222] outline-none transition text-sm'

  const selectClass =
    inputStyle === 'underline'
      ? 'w-full px-0 py-2.5 bg-transparent border-0 border-b border-[#222222]/40 rounded-none text-[#222222] focus:border-b-[#222222] focus:ring-0 outline-none transition-colors text-xs font-light appearance-none cursor-pointer'
      : inputStyle === 'minimal'
      ? 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200/90 bg-white/60 text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition text-xs appearance-none cursor-pointer'
      : 'w-full px-4 py-3 rounded-xl border border-[#DCD6CD] bg-white text-gray-900 focus:border-[#222222] focus:ring-1 focus:ring-[#222222] outline-none transition text-sm appearance-none cursor-pointer'

  const textareaClass =
    inputStyle === 'underline'
      ? 'w-full px-0 py-2.5 bg-transparent border-0 border-b border-[#222222]/40 rounded-none text-[#222222] placeholder:text-[#222222]/35 focus:border-b-[#222222] focus:ring-0 outline-none transition-colors text-xs font-light resize-y'
      : inputStyle === 'minimal'
      ? 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200/90 bg-white/60 text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition text-xs resize-y'
      : 'w-full px-4 py-3 rounded-xl border border-[#DCD6CD] bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#222222] focus:ring-1 focus:ring-[#222222] outline-none transition text-sm resize-y'

  const labelClass =
    inputStyle === 'underline'
      ? 'block text-[11px] uppercase tracking-wider font-semibold text-[#222222] mb-1'
      : 'block text-xs uppercase tracking-wider font-medium text-gray-600 mb-1.5'

  const shapeClass =
    buttonShape === 'pill'
      ? 'rounded-full'
      : buttonShape === 'rounded'
      ? 'rounded-xl'
      : 'rounded-none'

  // Render Form Content
  const renderFormInner = () => {
    if (submitted) {
      return (
        <div className="bg-[#FAF7F2] border border-[#E8E2D9] text-[#222222] rounded-2xl p-8 text-center space-y-3">
          <div className="text-3xl">✨</div>
          <h4 className="font-serif text-xl font-normal text-[#222222]">Message bien envoyé</h4>
          <p className="text-sm text-[#555555] max-w-md mx-auto leading-relaxed">
            Merci de nous avoir contactés. Nous revenons vers vous sous 24 à 48 heures ouvrées pour échanger sur votre projet.
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              if (displayMode === 'modal') setIsModalOpen(false)
            }}
            className="mt-4 inline-block text-xs uppercase tracking-widest font-semibold text-[#9E2123] underline hover:opacity-80 cursor-pointer"
          >
            Envoyer une autre demande
          </button>
        </div>
      )
    }

    const activeFieldsToRender = isMultiStepMode ? steps[currentStep] || [] : fields

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Multi-step progress bar */}
        {isMultiStepMode && (
          <div className="space-y-2 pb-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
              <span className="uppercase tracking-wider">
                Étape {currentStep + 1} sur {steps.length}
              </span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#222222] transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-sm border border-red-200">
            {error}
          </div>
        )}

        {hasCustomFields ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
            {activeFieldsToRender.map((field) => {
              if (field.type === 'recaptcha_v3') return null

              const colSpanClass = field.width === 50 ? 'md:col-span-1' : 'md:col-span-2'

              // 1. Textarea
              if (field.type === 'textarea') {
                return (
                  <div key={field.id} className={colSpanClass}>
                    {field.label && (
                      <label className={labelClass}>
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                    )}
                    <textarea
                      required={field.required}
                      rows={3}
                      placeholder={field.placeholder || ''}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className={textareaClass}
                    />
                  </div>
                )
              }

              // 2. Select dropdown
              if (field.type === 'select') {
                return (
                  <div key={field.id} className={colSpanClass}>
                    {field.label && (
                      <label className={labelClass}>
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                    )}
                    <div className="relative">
                      <select
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className={selectClass}
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
                    <label className={labelClass}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                  )}
                  <input
                    type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'number' ? 'number' : 'text'}
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className={inputClass}
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

        {/* Buttons: Multi-step Prev/Next or Final Submit */}
        <div className="pt-3 flex items-center gap-3">
          {isMultiStepMode && currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className={`py-3.5 px-6 border border-gray-300 text-gray-700 ${shapeClass} font-semibold text-xs tracking-wider uppercase transition hover:bg-gray-100 cursor-pointer`}
            >
              ← Précédent
            </button>
          )}

          {isMultiStepMode && !isLastStep ? (
            <button
              type="button"
              onClick={handleNextStep}
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
              className={`flex-1 py-4 px-8 ${shapeClass} font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:opacity-90 active:scale-[0.99] shadow-sm cursor-pointer flex items-center justify-center gap-2`}
            >
              <span>Continuer →</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
              className={`flex-1 py-4 px-8 ${shapeClass} font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:opacity-90 active:scale-[0.99] shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2`}
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
          )}
        </div>
      </form>
    )
  }

  // 1. MODAL DISPLAY MODE: Render Trigger Button and Lightbox Modal
  if (displayMode === 'modal') {
    return (
      <div className="inline-block">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
          className={`py-3.5 px-7 ${shapeClass} font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:opacity-90 shadow-md cursor-pointer`}
        >
          {modalTriggerText}
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#FAF8F5] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>

              {title && <h3 className="text-2xl font-normal text-gray-900 mb-2 font-serif">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500 mb-6">{subtitle}</p>}

              {renderFormInner()}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 2. INLINE / MULTISTEP MODE
  return (
    <div className={wrapperClass}>
      {title && <h3 className="text-2xl font-normal text-gray-900 mb-2 font-serif">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mb-6">{subtitle}</p>}
      {renderFormInner()}
    </div>
  )
}
