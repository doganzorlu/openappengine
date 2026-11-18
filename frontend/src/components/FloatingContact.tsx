import React, { useState } from 'react'

interface FloatingContactProps {
  phone?: string
  whatsapp?: string
  message?: string
  label?: string
  position?: 'bottom-right' | 'bottom-left'
  bgColor?: string
  pulsing?: boolean
}

export const FloatingContact: React.FC<FloatingContactProps> = ({
  phone,
  whatsapp = '905551234567',
  message = 'Merhaba, bilgi almak istiyorum.',
  label = 'Bize Ulaşın',
  position = 'bottom-right',
  bgColor = '#25D366',
  pulsing = true,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const cleanWa = whatsapp.replace(/\D/g, '')
  const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(message)}`
  const posClass = position === 'bottom-left' ? 'left-6' : 'right-6'

  return (
    <div className={`fixed bottom-6 ${posClass} z-40 flex flex-col items-end gap-2.5`}>
      {/* Expanded Quick Contact Popover */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-64 animate-fadeIn flex flex-col gap-2.5 text-gray-800">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-gray-500">Hızlı İletişim</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-700 text-xs p-1"
            >
              ✕
            </button>
          </div>

          {whatsapp && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm shadow-sm">
                💬
              </div>
              <div className="flex flex-col">
                <span>WhatsApp'tan Yazın</span>
                <span className="text-[10px] text-gray-400 font-normal">Hızlı Yanıt</span>
              </div>
            </a>
          )}

          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 text-blue-800 text-xs font-bold transition"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm shadow-sm">
                📞
              </div>
              <div className="flex flex-col">
                <span>Telefonla Arayın</span>
                <span className="text-[10px] text-gray-400 font-normal">{phone}</span>
              </div>
            </a>
          )}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: bgColor }}
        className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full shadow-2xl text-white font-bold text-sm cursor-pointer hover:scale-105 transition-all duration-300"
      >
        {pulsing && !isOpen && (
          <span
            style={{ backgroundColor: bgColor }}
            className="absolute inset-0 rounded-full animate-ping opacity-30 pointer-events-none"
          />
        )}
        <span className="text-xl">💬</span>
        <span className="hidden sm:inline font-bold pr-1">{label}</span>
      </button>
    </div>
  )
}
