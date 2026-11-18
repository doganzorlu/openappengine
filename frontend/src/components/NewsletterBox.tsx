import React, { useState } from 'react'

interface NewsletterBoxProps {
  title?: string
  description?: string
  placeholder?: string
  buttonText?: string
  successMessage?: string
  accentColor?: string
  bgColor?: string
  textColor?: string
}

export const NewsletterBox: React.FC<NewsletterBoxProps> = ({
  title = 'Gelişmelerden İlk Siz Haberdar Olun',
  description = 'Yaz okulu kayıt tarihleri, konser davetiyeleri ve etkinlik bültenimiz için e-posta listemize katılın.',
  placeholder = 'E-posta adresinizi yazınız...',
  buttonText = 'Abone Ol',
  successMessage = '🎉 Teşekkür ederiz! Bülten kaydınız başarıyla alındı.',
  accentColor = '#4F46E5',
  bgColor = '#FFFFFF',
  textColor = '#1F2937',
}) => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setIsSubmitted(true)
  }

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className="rounded-3xl p-6 sm:p-10 my-6 shadow-xl border border-gray-100 max-w-3xl mx-auto text-center"
    >
      <div
        style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-xs"
      >
        📬
      </div>

      <h3 className="text-xl sm:text-2xl font-extrabold mb-2 tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {isSubmitted ? (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 font-bold text-sm border border-emerald-200 animate-fadeIn max-w-md mx-auto">
          {successMessage}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/70 focus:bg-white text-sm focus:ring-2 focus:ring-purple-500 outline-none text-gray-800 shadow-inner"
          />
          <button
            type="submit"
            style={{ backgroundColor: accentColor }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-md hover:brightness-110 shrink-0 transition cursor-pointer"
          >
            {buttonText}
          </button>
        </form>
      )}
    </div>
  )
}
