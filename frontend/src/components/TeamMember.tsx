import React from 'react'

export interface TeamSocial {
  type: 'linkedin' | 'instagram' | 'twitter' | 'facebook' | 'email' | 'web'
  url: string
}

interface TeamMemberProps {
  name: string
  role?: string
  bio?: string
  imageUrl?: string
  socials?: TeamSocial[]
  accentColor?: string
  cardBg?: string
}

export const TeamMember: React.FC<TeamMemberProps> = ({
  name,
  role,
  bio,
  imageUrl,
  socials = [],
  accentColor = '#4F46E5',
  cardBg = '#FFFFFF',
}) => {
  const getSocialIcon = (type: string) => {
    switch (type) {
      case 'linkedin':
        return 'fab fa-linkedin-in'
      case 'instagram':
        return 'fab fa-instagram'
      case 'twitter':
        return 'fab fa-x-twitter'
      case 'facebook':
        return 'fab fa-facebook-f'
      case 'email':
        return 'fas fa-envelope'
      case 'web':
      default:
        return 'fas fa-globe'
    }
  }

  return (
    <div
      style={{ backgroundColor: cardBg }}
      className="rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between group my-3 max-w-sm w-full mx-auto"
    >
      <div>
        {/* Photo Container */}
        <div className="aspect-square w-full overflow-hidden bg-slate-100 relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-tr from-purple-100 to-indigo-100 text-purple-400">
              👤
            </div>
          )}

          {role && (
            <span
              style={{ backgroundColor: accentColor }}
              className="absolute bottom-3 left-3 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg backdrop-blur-xs"
            >
              {role}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-5 sm:p-6 space-y-2">
          <h4 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
            {name}
          </h4>

          {bio && (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
              {bio}
            </p>
          )}
        </div>
      </div>

      {/* Social Profiles */}
      {socials.length > 0 && (
        <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-gray-50 flex items-center gap-2">
          {socials.map((s, idx) => (
            <a
              key={idx}
              href={s.url || '#'}
              target="_blank"
              rel="noreferrer"
              title={s.type}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-600 hover:text-white text-gray-600 flex items-center justify-center text-xs transition-colors duration-200"
            >
              <i className={getSocialIcon(s.type)} />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
