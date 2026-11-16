import React from 'react'

interface DownloadsListProps {
  category: string
  title?: string
  itemsPerPage?: number
}

// Sample download packages migrated from WPDM in sim.berilzorlu.com
const sampleDownloads: Record<string, Array<{ id: string; title: string; desc: string; version: string; size: string }>> = {
  otobusler: [
    {
      id: '90',
      title: 'OMSI 2 Add-on Citybus o530 Facelift İzmir/Çanakkale Kaplamaları',
      desc: 'İzulaş ESHOT ve Çanakkale Özel Halk Otobüsü gerçekçi filo kaplamaları ve ses modları.',
      version: 'v1.4',
      size: '42 MB',
    },
    {
      id: '112',
      title: 'Mercedes-Benz O305 Klasik Belediye Otobüsü Paketi',
      desc: 'Nostaljik hatlar için optimize edilmiş yüksek kaliteli kaplama ve gösterge paketi.',
      version: 'v2.0',
      size: '28 MB',
    },
  ],
  haritalar: [
    {
      id: '52',
      title: 'Çanakkale Şehirlerarası & Kırsal Rota Modu',
      desc: 'Gerçekçi yol eğimleri, duraklar ve kavşaklar içeren detaylı Çanakkale simülasyon haritası.',
      version: 'v1.1',
      size: '120 MB',
    },
    {
      id: '100',
      title: 'İzmir Şehir İçi Otobüs Hatları Haritası',
      desc: 'Bornova - Konak - Karşıyaka güzergahları ve ESHOT hat tabelaları entegrasyonu.',
      version: 'v0.9 Beta',
      size: '210 MB',
    },
  ],
}

export const DownloadsList: React.FC<DownloadsListProps> = ({ category, title }) => {
  const items = sampleDownloads[category] || [
    {
      id: 'default-1',
      title: `${category.toUpperCase()} İndirme Paketi`,
      desc: 'Güncel simülasyon dosyaları ve eklentileri.',
      version: 'v1.0',
      size: '15 MB',
    },
  ]

  return (
    <div className="w-full my-8">
      {title && (
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-purple-600">📂</span>
          <span>{title}</span>
        </h3>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="px-2 py-0.5 rounded bg-gray-100 font-mono font-semibold">
                  {item.version}
                </span>
                <span>{item.size}</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">{item.desc}</p>
            </div>

            <a
              href="#download"
              onClick={(e) => {
                e.preventDefault()
                alert(`"${item.title}" indirme bağlantısı simülasyon sunucusundan başlatılıyor.`)
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-center text-sm shadow hover:scale-[1.02] active:scale-95 transition"
            >
              📥 Dosyayı İndir
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
