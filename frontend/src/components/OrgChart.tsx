import React, { useState } from 'react'
import defaultMembers from '../data/otizmkonfederasyonu_org_chart.json'
import { normalizeMediaUrl } from './ImageBox'

export interface OrgMember {
  name: string
  title: string
  image: string
  bio: string
}

interface OrgChartProps {
  title?: string
  members?: OrgMember[]
}

export const OrgChart: React.FC<OrgChartProps> = ({
  title = 'YÖNETİM KURULU',
  members = defaultMembers as OrgMember[],
}) => {
  const [activeMember, setActiveMember] = useState<OrgMember | null>(null)

  if (!members || members.length === 0) return null

  const president = members.find((m) => m.title.toLowerCase().includes('başkan') && !m.title.toLowerCase().includes('yrd')) || members[0]
  const otherMembers = members.filter((m) => m !== president)

  return (
    <div className="w-full my-8 text-center">
      {title && title !== 'Organizasyon Şeması' && (
        <h3 className="text-xl sm:text-2xl font-black text-white mb-8 tracking-wide uppercase drop-shadow-sm">
          {title}
        </h3>
      )}

      {/* Tree Top: President */}
      <div className="flex flex-col items-center">
        <div
          onClick={() => setActiveMember(president)}
          className="group relative cursor-pointer p-5 bg-gradient-to-b from-white to-amber-50/40 rounded-2xl border-2 border-amber-400 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 max-w-xs w-full flex flex-col items-center gap-3"
          title="Özgeçmişi Görmek İçin Tıklayın"
        >
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-amber-400 shadow-md bg-gray-100">
            <img
              src={normalizeMediaUrl(president.image)}
              alt={president.name}
              className="w-full h-full object-cover group-hover:scale-105 transition"
              loading="lazy"
            />
          </div>
          <div className="text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm mb-1">
              {president.title}
            </span>
            <h4 className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition">
              {president.name}
            </h4>
            <span className="text-[11px] text-gray-400 font-medium flex items-center justify-center gap-1 mt-1">
              <span>ℹ️</span> Detaylı Özgeçmiş
            </span>
          </div>
        </div>

        {/* Tree Connecting Branch Line */}
        <div className="w-0.5 h-10 bg-gradient-to-b from-amber-400 to-indigo-300 my-1" />
        <div className="w-full max-w-4xl h-0.5 bg-indigo-200 hidden md:block" />
      </div>

      {/* Tree Children: Board Members */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 max-w-6xl mx-auto">
        {otherMembers.map((member, idx) => (
          <div
            key={idx}
            onClick={() => setActiveMember(member)}
            className="group relative cursor-pointer p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-purple-300 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center justify-between"
            title="Özgeçmişi Görmek İçin Tıklayın"
          >
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-indigo-200 shadow-sm bg-gray-100 mb-3">
              <img
                src={normalizeMediaUrl(member.image)}
                alt={member.name}
                className="w-full h-full object-cover group-hover:scale-105 transition"
                loading="lazy"
              />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                {member.title}
              </span>
              <h5 className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition">
                {member.name}
              </h5>
            </div>
            <span className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 group-hover:text-purple-500 transition">
              <span>ℹ️</span> Detay
            </span>
          </div>
        ))}
      </div>

      {/* Member Bio Modal Popup */}
      {activeMember && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setActiveMember(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-gray-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-gray-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <img
                  src={activeMember.image}
                  alt={activeMember.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/60 shadow"
                />
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-gray-900 text-[10px] font-bold uppercase tracking-wider">
                    {activeMember.title}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{activeMember.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveMember(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-left text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
              <div
                className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-headings:text-base prose-strong:text-gray-900 prose-ul:list-disc prose-ul:pl-5 space-y-3"
                dangerouslySetInnerHTML={{ __html: activeMember.bio }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setActiveMember(null)}
                className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
