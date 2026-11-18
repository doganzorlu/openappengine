import React from 'react'

export interface SocialIconItem {
  platform: 'instagram' | 'youtube' | 'facebook' | 'twitter' | 'linkedin' | 'spotify' | 'whatsapp' | 'email'
  url: string
}

interface SocialIconsProps {
  items?: SocialIconItem[]
  styleType?: 'colored' | 'monochrome' | 'outline'
  size?: 'small' | 'medium' | 'large'
  align?: 'left' | 'center' | 'right'
}

export const SocialIcons: React.FC<SocialIconsProps> = ({
  items = [
    { platform: 'instagram', url: 'https://instagram.com' },
    { platform: 'youtube', url: 'https://youtube.com' },
    { platform: 'facebook', url: 'https://facebook.com' },
    { platform: 'spotify', url: 'https://spotify.com' },
  ],
  styleType = 'colored',
  size = 'medium',
  align = 'center',
}) => {
  const getPlatformData = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return { icon: 'fab fa-instagram', bg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600', color: 'text-white' }
      case 'youtube':
        return { icon: 'fab fa-youtube', bg: 'bg-red-600', color: 'text-white' }
      case 'facebook':
        return { icon: 'fab fa-facebook-f', bg: 'bg-blue-600', color: 'text-white' }
      case 'twitter':
        return { icon: 'fab fa-x-twitter', bg: 'bg-black', color: 'text-white' }
      case 'linkedin':
        return { icon: 'fab fa-linkedin-in', bg: 'bg-sky-700', color: 'text-white' }
      case 'spotify':
        return { icon: 'fab fa-spotify', bg: 'bg-emerald-500', color: 'text-white' }
      case 'whatsapp':
        return { icon: 'fab fa-whatsapp', bg: 'bg-emerald-600', color: 'text-white' }
      case 'email':
      default:
        return { icon: 'fas fa-envelope', bg: 'bg-slate-700', color: 'text-white' }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8 text-xs'
      case 'large':
        return 'w-14 h-14 text-xl'
      case 'medium':
      default:
        return 'w-11 h-11 text-base'
    }
  }

  const getAlignClass = () => {
    switch (align) {
      case 'left':
        return 'justify-start'
      case 'right':
        return 'justify-end'
      case 'center':
      default:
        return 'justify-center'
    }
  }

  return (
    <div className={`flex items-center gap-3 my-4 flex-wrap ${getAlignClass()}`}>
      {items.map((item, idx) => {
        const data = getPlatformData(item.platform)
        let styleClass = `${data.bg} ${data.color} shadow-md`
        if (styleType === 'monochrome') {
          styleClass = 'bg-gray-800 text-white hover:bg-gray-900 shadow-sm'
        } else if (styleType === 'outline') {
          styleClass = 'border-2 border-gray-300 text-gray-700 hover:border-gray-900 hover:text-black bg-transparent'
        }

        return (
          <a
            key={idx}
            href={item.url || '#'}
            target="_blank"
            rel="noreferrer"
            title={item.platform}
            className={`${getSizeClasses()} ${styleClass} rounded-2xl flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
          >
            <i className={data.icon} />
          </a>
        )
      })}
    </div>
  )
}
