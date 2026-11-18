import React, { useState } from 'react'
import type { ComponentNode } from '../types'
import { MediaPickerModal, type MediaItem } from './MediaPickerModal'
import { ColorPickerInput } from './ColorPickerInput'

interface InspectorPanelProps {
  selectedNode: ComponentNode | null
  onUpdateNode: (updatedNode: ComponentNode) => void
  onDeleteNode: (nodeId: string) => void
  onClose: () => void
  siteSlug?: string
  token?: string
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  onClose,
  siteSlug = 'otizmuzikokulu',
  token = '',
}) => {
  const [activeTab, setActiveTab] = useState<'props' | 'styles'>(() => {
    return new URLSearchParams(window.location.search).get('tab') === 'styles' ? 'styles' : 'props'
  })
  const [pickerConfig, setPickerConfig] = useState<{
    isOpen: boolean
    targetKey: string
    allowedTypes: 'all' | 'image' | 'document'
    title: string
  }>({
    isOpen: false,
    targetKey: '',
    allowedTypes: 'image',
    title: 'Görsel Seç',
  })

  if (!selectedNode) {
    return (
      <aside className="fixed right-0 top-14 bottom-0 w-80 sm:w-96 bg-white border-l border-gray-200 flex flex-col items-center justify-center text-center text-gray-400 p-6 z-40 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-3xl mb-3 shadow-inner">
          🎯
        </div>
        <h3 className="text-base font-bold text-gray-800">Bileşen Seçin</h3>
        <p className="text-xs text-gray-500 mt-1.5 max-w-[220px] leading-relaxed">
          Düzenlemek istediğiniz herhangi bir bileşenin üzerine tıklayın.
        </p>
      </aside>
    )
  }

  const { type, props = {}, styles = {} } = selectedNode

  const handlePropChange = (key: string, value: any) => {
    onUpdateNode({
      ...selectedNode,
      props: {
        ...props,
        [key]: value,
      },
    })
  }

  const handleStyleChange = (key: string, value: any) => {
    onUpdateNode({
      ...selectedNode,
      styles: {
        ...styles,
        [key]: value,
      },
    })
  }

  return (
    <aside className="fixed right-0 top-14 bottom-0 w-80 sm:w-96 bg-white border-l border-gray-200 flex flex-col shadow-2xl z-40 overflow-hidden">
      {/* Header */}
      <div className="p-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-bold uppercase font-mono">
            {type}
          </span>
          <span className="text-xs text-gray-400 font-mono truncate max-w-[120px]">
            #{selectedNode.id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDeleteNode(selectedNode.id)}
            title="Bileşeni Sil"
            className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 transition"
          >
            Sil
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-sm px-2 py-1 rounded hover:bg-gray-200 transition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-medium shrink-0">
        <button
          onClick={() => setActiveTab('props')}
          className={`flex-1 py-2.5 text-center transition ${
            activeTab === 'props'
              ? 'border-b-2 border-purple-600 text-purple-600 bg-white font-semibold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          İçerik & Özellikler
        </button>
        <button
          onClick={() => setActiveTab('styles')}
          className={`flex-1 py-2.5 text-center transition ${
            activeTab === 'styles'
              ? 'border-b-2 border-purple-600 text-purple-600 bg-white font-semibold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Stil & Boyutlar
        </button>
      </div>

      {/* Content Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs overscroll-contain inspector-scroll">
        {activeTab === 'props' && (
          <div className="space-y-4">
            {/* Heading Props */}
            {type === 'Heading' && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Başlık Metni</label>
                  <input
                    type="text"
                    value={props.text || ''}
                    onChange={(e) => handlePropChange('text', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Başlık Düzeyi (Tag)</label>
                  <select
                    value={props.level || 'h2'}
                    onChange={(e) => handlePropChange('level', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="h1">H1 - Ana Başlık</option>
                    <option value="h2">H2 - Alt Başlık</option>
                    <option value="h3">H3 - Bölüm Başlığı</option>
                    <option value="h4">H4 - Küçük Başlık</option>
                  </select>
                </div>
                <ColorPickerInput
                  label="Metin Rengi"
                  value={props.color || styles.color}
                  onChange={(c) => {
                    handlePropChange('color', c)
                    handleStyleChange('color', c)
                  }}
                />
              </>
            )}

            {/* RichText Props */}
            {type === 'RichText' && (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">HTML İçeriği</label>
                <textarea
                  rows={8}
                  value={props.html || ''}
                  onChange={(e) => handlePropChange('html', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            )}

            {/* Button Props */}
            {type === 'Button' && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Buton Metni</label>
                  <input
                    type="text"
                    value={props.text || ''}
                    onChange={(e) => handlePropChange('text', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">Hedef Bağlantı (URL)</label>
                    <button
                      type="button"
                      onClick={() =>
                        setPickerConfig({
                          isOpen: true,
                          targetKey: 'url',
                          allowedTypes: 'all',
                          title: 'Hedef Dosya / PDF Seç',
                        })
                      }
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      📄 Medya / PDF Seç
                    </button>
                  </div>
                  <input
                    type="text"
                    value={props.url || ''}
                    onChange={(e) => handlePropChange('url', e.target.value)}
                    placeholder="https://... veya /storage/...pdf"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Hedef Sekme</label>
                  <select
                    value={props.target || '_self'}
                    onChange={(e) => handlePropChange('target', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="_self">Aynı Pencere (_self)</option>
                    <option value="_blank">Yeni Pencere (_blank)</option>
                  </select>
                </div>
                <ColorPickerInput
                  label="Buton Arka Plan Rengi"
                  value={props.bgColor || styles.backgroundColor}
                  onChange={(c) => {
                    handlePropChange('bgColor', c)
                    handleStyleChange('backgroundColor', c)
                  }}
                />
                <ColorPickerInput
                  label="Buton Yazı Rengi"
                  value={props.textColor || styles.color}
                  onChange={(c) => {
                    handlePropChange('textColor', c)
                    handleStyleChange('color', c)
                  }}
                />
              </>
            )}

            {/* Image Props */}
            {type === 'Image' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">Görsel URL</label>
                    <button
                      type="button"
                      onClick={() =>
                        setPickerConfig({
                          isOpen: true,
                          targetKey: 'url',
                          allowedTypes: 'image',
                          title: 'Görsel Seç',
                        })
                      }
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      🖼️ Medyadan Seç
                    </button>
                  </div>
                  <input
                    type="text"
                    value={props.url || ''}
                    onChange={(e) => handlePropChange('url', e.target.value)}
                    placeholder="/storage/... veya https://..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Alt Açıklama (SEO)</label>
                  <input
                    type="text"
                    value={props.alt || ''}
                    onChange={(e) => handlePropChange('alt', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </>
            )}

            {/* Video Props */}
            {type === 'Video' && (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">YouTube / Video URL</label>
                <input
                  type="text"
                  value={props.url || ''}
                  onChange={(e) => handlePropChange('url', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            )}

            {/* Counter Props */}
            {type === 'Counter' && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Bitiş Sayısı</label>
                  <input
                    type="number"
                    value={props.endingNumber || 0}
                    onChange={(e) => handlePropChange('endingNumber', Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Başlık</label>
                  <input
                    type="text"
                    value={props.title || ''}
                    onChange={(e) => handlePropChange('title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Ön Ek</label>
                    <input
                      type="text"
                      value={props.prefix || ''}
                      onChange={(e) => handlePropChange('prefix', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Son Ek</label>
                    <input
                      type="text"
                      value={props.suffix || ''}
                      onChange={(e) => handlePropChange('suffix', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ImageBox Props */}
            {type === 'ImageBox' && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Başlık</label>
                  <input
                    type="text"
                    value={props.title || ''}
                    onChange={(e) => handlePropChange('title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Açıklama</label>
                  <textarea
                    rows={3}
                    value={props.description || ''}
                    onChange={(e) => handlePropChange('description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">Görsel URL</label>
                    <button
                      type="button"
                      onClick={() =>
                        setPickerConfig({
                          isOpen: true,
                          targetKey: 'imageUrl',
                          allowedTypes: 'image',
                          title: 'Kart Görseli Seç',
                        })
                      }
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      🖼️ Medyadan Seç
                    </button>
                  </div>
                  <input
                    type="text"
                    value={props.imageUrl || ''}
                    onChange={(e) => handlePropChange('imageUrl', e.target.value)}
                    placeholder="/storage/... veya https://..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">Tıklama Bağlantısı (URL)</label>
                    <button
                      type="button"
                      onClick={() =>
                        setPickerConfig({
                          isOpen: true,
                          targetKey: 'url',
                          allowedTypes: 'all',
                          title: 'Hedef Belge / Link Seç',
                        })
                      }
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      📄 Medya / PDF Seç
                    </button>
                  </div>
                  <input
                    type="text"
                    value={props.url || ''}
                    onChange={(e) => handlePropChange('url', e.target.value)}
                    placeholder="https://... veya #hedef"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </>
            )}

            {/* Section Props */}
            {type === 'Section' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">Arka Plan Görseli</label>
                    <button
                      type="button"
                      onClick={() =>
                        setPickerConfig({
                          isOpen: true,
                          targetKey: 'bgImage',
                          allowedTypes: 'image',
                          title: 'Arka Plan Görseli Seç',
                        })
                      }
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      🖼️ Medyadan Seç
                    </button>
                  </div>
                  <input
                    type="text"
                    value={props.bgImage || ''}
                    onChange={(e) => handlePropChange('bgImage', e.target.value)}
                    placeholder="/storage/..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <ColorPickerInput
                  label="Arka Plan Rengi"
                  value={props.bgColor || styles.backgroundColor}
                  onChange={(c) => {
                    handlePropChange('bgColor', c)
                    handleStyleChange('backgroundColor', c)
                  }}
                />
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Minimum Yükseklik</label>
                  <input
                    type="text"
                    value={props.minHeight || ''}
                    onChange={(e) => handlePropChange('minHeight', e.target.value)}
                    placeholder="örn: 500px veya 80vh"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </>
            )}

            {/* Spacer Props */}
            {type === 'Spacer' && (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Boşluk Yüksekliği</label>
                <input
                  type="text"
                  value={props.height || '30px'}
                  onChange={(e) => handlePropChange('height', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            )}

            {/* Countdown Props */}
            {type === 'Countdown' && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Başlık</label>
                  <input
                    type="text"
                    value={props.title || ''}
                    placeholder="Örn: Etkinliğe Kalan Süre"
                    onChange={(e) => handlePropChange('title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Hedef Tarih & Saat</label>
                  <input
                    type="datetime-local"
                    value={props.targetDate ? props.targetDate.slice(0, 16) : ''}
                    onChange={(e) => handlePropChange('targetDate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Örn: 2026-07-06 09:00</p>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Süre Bitince Mesajı</label>
                  <input
                    type="text"
                    value={props.completedText || ''}
                    placeholder="Örn: Etkinlik Başladı!"
                    onChange={(e) => handlePropChange('completedText', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <ColorPickerInput
                  label="Vurgu Rengi"
                  value={props.accentColor || '#4F46E5'}
                  onChange={(c) => handlePropChange('accentColor', c)}
                />
                <ColorPickerInput
                  label="Kutu Arka Planı"
                  value={props.boxBg || '#1E293B'}
                  onChange={(c) => handlePropChange('boxBg', c)}
                />
              </>
            )}

            {/* PostGrid Props */}
            {type === 'PostGrid' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Yazı Sayısı</label>
                    <select
                      value={props.count || 3}
                      onChange={(e) => handlePropChange('count', Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value={3}>3 Yazı</option>
                      <option value={6}>6 Yazı</option>
                      <option value={9}>9 Yazı</option>
                      <option value={12}>12 Yazı</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Sütun Sayısı</label>
                    <select
                      value={props.columns || 3}
                      onChange={(e) => handlePropChange('columns', Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value={1}>1 Sütun</option>
                      <option value={2}>2 Sütun</option>
                      <option value={3}>3 Sütun</option>
                      <option value={4}>4 Sütun</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Görünürlük Ayarları</label>
                  <div className="space-y-1.5 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={props.showImage !== false}
                        onChange={(e) => handlePropChange('showImage', e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-700 font-medium">Öne Çıkan Görseli Göster</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={props.showDate !== false}
                        onChange={(e) => handlePropChange('showDate', e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-700 font-medium">Tarih Bilgisini Göster</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={props.showExcerpt !== false}
                        onChange={(e) => handlePropChange('showExcerpt', e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-700 font-medium">Özet Metni Göster</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Buton Metni</label>
                  <input
                    type="text"
                    value={props.readMoreText || 'Devamını Oku →'}
                    onChange={(e) => handlePropChange('readMoreText', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </>
            )}

            {/* TeamMember Props */}
            {type === 'TeamMember' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">Fotoğraf / Avatar</label>
                    <button
                      type="button"
                      onClick={() =>
                        setPickerConfig({
                          isOpen: true,
                          targetKey: 'imageUrl',
                          allowedTypes: 'image',
                          title: 'Ekip Üyesi Fotoğrafı Seç',
                        })
                      }
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      🖼️ Medyadan Seç
                    </button>
                  </div>
                  <input
                    type="text"
                    value={props.imageUrl || ''}
                    placeholder="/storage/..."
                    onChange={(e) => handlePropChange('imageUrl', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    value={props.name || ''}
                    placeholder="Örn: Prof. Dr. Uğur TÜRKMEN"
                    onChange={(e) => handlePropChange('name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Unvan / Görev</label>
                  <input
                    type="text"
                    value={props.role || ''}
                    placeholder="Örn: Düzenleme Kurulu Başkanı"
                    onChange={(e) => handlePropChange('role', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Kısa Biyografi / Açıklama</label>
                  <textarea
                    rows={3}
                    value={props.bio || ''}
                    placeholder="Uzmanlık alanı veya kısa tanıtım..."
                    onChange={(e) => handlePropChange('bio', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <ColorPickerInput
                  label="Rozet & Vurgu Rengi"
                  value={props.accentColor || '#4F46E5'}
                  onChange={(c) => handlePropChange('accentColor', c)}
                />
              </>
            )}

            {/* LogoTicker Props */}
            {type === 'LogoTicker' && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Kayma Hızı</label>
                  <select
                    value={props.speed || 'normal'}
                    onChange={(e) => handlePropChange('speed', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="slow">Yavaş (45s)</option>
                    <option value="normal">Normal (28s)</option>
                    <option value="fast">Hızlı (15s)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Akış Yönü</label>
                  <select
                    value={props.direction || 'left'}
                    onChange={(e) => handlePropChange('direction', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="left">Sola Doğru ⬅️</option>
                    <option value="right">Sağa Doğru ➡️</option>
                  </select>
                </div>
                <div className="space-y-1.5 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={props.grayscale !== false}
                      onChange={(e) => handlePropChange('grayscale', e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700 font-medium">Siyah-Beyaz Başla (Hover'da Renkli)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={props.pauseOnHover !== false}
                      onChange={(e) => handlePropChange('pauseOnHover', e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700 font-medium">Fare Üzerindeyken Duraklat</span>
                  </label>
                </div>
              </>
            )}

            {/* PricingTable Props */}
            {type === 'PricingTable' && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Paket Başlığı</label>
                  <input
                    type="text"
                    value={props.title || ''}
                    placeholder="Örn: 1 Çocuk Müzik Bursu"
                    onChange={(e) => handlePropChange('title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Tutar / Fiyat</label>
                    <input
                      type="text"
                      value={props.price || ''}
                      placeholder="Örn: 750 ₺"
                      onChange={(e) => handlePropChange('price', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Periyot</label>
                    <input
                      type="text"
                      value={props.period || ''}
                      placeholder="/ aylık"
                      onChange={(e) => handlePropChange('period', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Kısa Açıklama</label>
                  <textarea
                    rows={2}
                    value={props.description || ''}
                    placeholder="Paket detayını anlatan kısa özet..."
                    onChange={(e) => handlePropChange('description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Rozet Metni</label>
                    <input
                      type="text"
                      value={props.badge || ''}
                      placeholder="Popüler, Tavsiye"
                      onChange={(e) => handlePropChange('badge', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={props.isFeatured || false}
                        onChange={(e) => handlePropChange('isFeatured', e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-700 font-semibold text-xs">Öne Çıkar (Vurgulu)</span>
                    </label>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">Özellikler Listesi</label>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = props.features || []
                        handlePropChange('features', [...cur, { text: 'Yeni Özellik', included: true }])
                      }}
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800"
                    >
                      + Madde Ekle
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {(props.features || []).map((feat: any, fIdx: number) => (
                      <div key={fIdx} className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                          type="checkbox"
                          checked={feat.included !== false}
                          onChange={(e) => {
                            const cur = [...(props.features || [])]
                            cur[fIdx] = { ...cur[fIdx], included: e.target.checked }
                            handlePropChange('features', cur)
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500 shrink-0"
                          title="Dahil / Hariç"
                        />
                        <input
                          type="text"
                          value={feat.text || ''}
                          onChange={(e) => {
                            const cur = [...(props.features || [])]
                            cur[fIdx] = { ...cur[fIdx], text: e.target.value }
                            handlePropChange('features', cur)
                          }}
                          className="flex-1 px-2 py-1 text-xs border rounded bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = (props.features || []).filter((_: any, i: number) => i !== fIdx)
                            handlePropChange('features', cur)
                          }}
                          className="text-gray-400 hover:text-red-500 px-1 text-sm shrink-0"
                          title="Sil"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Buton Metni</label>
                    <input
                      type="text"
                      value={props.buttonText || ''}
                      placeholder="Hemen Destek Ol"
                      onChange={(e) => handlePropChange('buttonText', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Buton Linki</label>
                    <input
                      type="text"
                      value={props.buttonUrl || ''}
                      placeholder="https://... veya #"
                      onChange={(e) => handlePropChange('buttonUrl', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
                <ColorPickerInput
                  label="Vurgu Rengi"
                  value={props.accentColor || '#4F46E5'}
                  onChange={(c) => handlePropChange('accentColor', c)}
                />
              </>
            )}

            {/* Testimonial Props */}
            {type === 'Testimonial' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">Profil Fotoğrafı</label>
                    <button
                      type="button"
                      onClick={() =>
                        setPickerConfig({
                          isOpen: true,
                          targetKey: 'imageUrl',
                          allowedTypes: 'image',
                          title: 'Profil Fotoğrafı Seç',
                        })
                      }
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      🖼️ Medyadan Seç
                    </button>
                  </div>
                  <input
                    type="text"
                    value={props.imageUrl || ''}
                    placeholder="/storage/..."
                    onChange={(e) => handlePropChange('imageUrl', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Kişi Adı Soyadı</label>
                  <input
                    type="text"
                    value={props.name || ''}
                    placeholder="Örn: Ayşe Hanım"
                    onChange={(e) => handlePropChange('name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Unvan / Açıklama</label>
                  <input
                    type="text"
                    value={props.role || ''}
                    placeholder="Örn: Öğrenci Velisi, İzmir"
                    onChange={(e) => handlePropChange('role', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Görüş / Alıntı Metni</label>
                  <textarea
                    rows={4}
                    value={props.quote || ''}
                    placeholder="Kişinin deneyim ve değerlendirmesi..."
                    onChange={(e) => handlePropChange('quote', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Yıldız Puanı (1 - 5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handlePropChange('rating', s)}
                        className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                          (props.rating ?? 5) >= s
                            ? 'bg-amber-50 border-amber-400 text-amber-600'
                            : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}
                      >
                        {s} ★
                      </button>
                    ))}
                  </div>
                </div>
                <ColorPickerInput
                  label="Yıldız & Vurgu Rengi"
                  value={props.accentColor || '#F59E0B'}
                  onChange={(c) => handlePropChange('accentColor', c)}
                />
              </>
            )}

            {/* ProgressBar Props */}
            {type === 'ProgressBar' && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Etiket / Başlık</label>
                  <input
                    type="text"
                    value={props.label || ''}
                    placeholder="Örn: 2026 Yaz Okulu Kayıt Kontenjanı"
                    onChange={(e) => handlePropChange('label', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">Yüzde Oranı (%)</label>
                    <span className="font-bold text-purple-700 text-sm">%{props.percentage ?? 75}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={props.percentage ?? 75}
                    onChange={(e) => handlePropChange('percentage', parseInt(e.target.value, 10))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Özel Değer Metni (İsteğe Bağlı)</label>
                  <input
                    type="text"
                    value={props.valueText || ''}
                    placeholder="Örn: %78 Doldu (39 / 50 Öğrenci) veya 195.000 ₺ / 250.000 ₺"
                    onChange={(e) => handlePropChange('valueText', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Çubuk Kalınlığı (px)</label>
                    <input
                      type="number"
                      min="8"
                      max="48"
                      value={props.height || 16}
                      onChange={(e) => handlePropChange('height', parseInt(e.target.value, 10) || 16)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={props.showStripes !== false}
                        onChange={(e) => handlePropChange('showStripes', e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-700 font-semibold text-xs">Çizgili Animasyon</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ColorPickerInput
                    label="Dolgu Rengi"
                    value={props.barColor || '#10B981'}
                    onChange={(c) => handlePropChange('barColor', c)}
                  />
                  <ColorPickerInput
                    label="Kanal Arka Planı"
                    value={props.trackBg || '#E2E8F0'}
                    onChange={(c) => handlePropChange('trackBg', c)}
                  />
                </div>
              </>
            )}

            {/* Accordion Props */}
            {type === 'Accordion' && (
              <>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-700 font-semibold text-xs">Aynı Anda Birden Fazla Açılabilir</span>
                  <input
                    type="checkbox"
                    checked={props.allowMultiple || false}
                    onChange={(e) => handlePropChange('allowMultiple', e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </div>
                <ColorPickerInput
                  label="Vurgu & İkon Rengi"
                  value={props.accentColor || '#4F46E5'}
                  onChange={(c) => handlePropChange('accentColor', c)}
                />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">Maddeler (Sorular & İçerik)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = props.items || []
                        handlePropChange('items', [
                          ...cur,
                          { id: 'item_' + Date.now(), title: 'Yeni Soru / Başlık', content: '<p>Cevap ve açıklama metni buraya gelecek.</p>' },
                        ])
                      }}
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800"
                    >
                      + Madde Ekle
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {(props.items || []).map((item: any, itmIdx: number) => (
                      <div key={itmIdx} className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <input
                            type="text"
                            value={item.title || ''}
                            placeholder="Madde Başlığı"
                            onChange={(e) => {
                              const cur = [...(props.items || [])]
                              cur[itmIdx] = { ...cur[itmIdx], title: e.target.value }
                              handlePropChange('items', cur)
                            }}
                            className="flex-1 px-2 py-1 text-xs font-bold border rounded bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const cur = (props.items || []).filter((_: any, i: number) => i !== itmIdx)
                              handlePropChange('items', cur)
                            }}
                            className="text-gray-400 hover:text-red-500 px-1 text-sm shrink-0"
                            title="Sil"
                          >
                            ✕
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={item.content || ''}
                          placeholder="İçerik (HTML destekli)..."
                          onChange={(e) => {
                            const cur = [...(props.items || [])]
                            cur[itmIdx] = { ...cur[itmIdx], content: e.target.value }
                            handlePropChange('items', cur)
                          }}
                          className="w-full px-2 py-1 text-xs border rounded bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Tabs Props */}
            {type === 'Tabs' && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sekme Stili</label>
                  <select
                    value={props.tabStyle || 'pills'}
                    onChange={(e) => handlePropChange('tabStyle', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="pills">Hap Butonlar (Pills)</option>
                    <option value="underline">Alt Çizgili (Underline)</option>
                  </select>
                </div>
                <ColorPickerInput
                  label="Aktif Sekme Rengi"
                  value={props.accentColor || '#4F46E5'}
                  onChange={(c) => handlePropChange('accentColor', c)}
                />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">Sekmeler Listesi</label>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = props.tabs || []
                        handlePropChange('tabs', [
                          ...cur,
                          { id: 'tab_' + Date.now(), title: `Sekme ${cur.length + 1}`, content: '<p>Sekme içeriği buraya gelecek.</p>' },
                        ])
                      }}
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800"
                    >
                      + Sekme Ekle
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {(props.tabs || []).map((tab: any, tabIdx: number) => (
                      <div key={tabIdx} className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <input
                            type="text"
                            value={tab.title || ''}
                            placeholder="Sekme Başlığı"
                            onChange={(e) => {
                              const cur = [...(props.tabs || [])]
                              cur[tabIdx] = { ...cur[tabIdx], title: e.target.value }
                              handlePropChange('tabs', cur)
                            }}
                            className="flex-1 px-2 py-1 text-xs font-bold border rounded bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const cur = (props.tabs || []).filter((_: any, i: number) => i !== tabIdx)
                              handlePropChange('tabs', cur)
                            }}
                            className="text-gray-400 hover:text-red-500 px-1 text-sm shrink-0"
                            title="Sil"
                          >
                            ✕
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={tab.content || ''}
                          placeholder="Sekme içeriği..."
                          onChange={(e) => {
                            const cur = [...(props.tabs || [])]
                            cur[tabIdx] = { ...cur[tabIdx], content: e.target.value }
                            handlePropChange('tabs', cur)
                          }}
                          className="w-full px-2 py-1 text-xs border rounded bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* CallToAction Props */}
            {type === 'CallToAction' && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Üst Küçük Başlık (Subtitle)</label>
                  <input
                    type="text"
                    value={props.subtitle || ''}
                    placeholder="Örn: KATILIM VE KAYIT"
                    onChange={(e) => handlePropChange('subtitle', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Ana Başlık</label>
                  <input
                    type="text"
                    value={props.title || ''}
                    placeholder="Örn: Geleceğe Birlikte Nota Bırakalım!"
                    onChange={(e) => handlePropChange('title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Açıklama Metni</label>
                  <textarea
                    rows={3}
                    value={props.description || ''}
                    placeholder="Eylem çağrısı detay metni..."
                    onChange={(e) => handlePropChange('description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Dizilim Düzeni</label>
                  <select
                    value={props.layout || 'centered'}
                    onChange={(e) => handlePropChange('layout', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="centered">Ortalanmış (Centered)</option>
                    <option value="left-aligned">Yan Yana (Left-aligned & Buton Sağda)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">1. Buton Metni</label>
                    <input
                      type="text"
                      value={props.buttonText || ''}
                      placeholder="Hemen Başvurun"
                      onChange={(e) => handlePropChange('buttonText', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">1. Buton Linki</label>
                    <input
                      type="text"
                      value={props.buttonUrl || ''}
                      placeholder="https://... veya #"
                      onChange={(e) => handlePropChange('buttonUrl', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">2. Buton Metni (Opsiyonel)</label>
                    <input
                      type="text"
                      value={props.secondaryButtonText || ''}
                      placeholder="Detaylı Bilgi Al"
                      onChange={(e) => handlePropChange('secondaryButtonText', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">2. Buton Linki</label>
                    <input
                      type="text"
                      value={props.secondaryButtonUrl || ''}
                      placeholder="/hakkimizda"
                      onChange={(e) => handlePropChange('secondaryButtonUrl', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ColorPickerInput
                    label="Vurgu Rengi"
                    value={props.accentColor || '#FFB92C'}
                    onChange={(c) => handlePropChange('accentColor', c)}
                  />
                  <ColorPickerInput
                    label="Arka Plan Rengi"
                    value={props.bgColor || '#0F172A'}
                    onChange={(c) => handlePropChange('bgColor', c)}
                  />
                </div>
              </>
            )}

            {/* AlertBox Props */}
            {type === 'AlertBox' && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Duyuru / Uyarı Türü</label>
                  <select
                    value={props.alertType || props.type || 'info'}
                    onChange={(e) => handlePropChange('alertType', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="info">Bilgilendirme (Mavi)</option>
                    <option value="success">Başarı / Onay (Yeşil)</option>
                    <option value="warning">Uyarı / Dikkat (Sarı)</option>
                    <option value="urgent">Acil / Önemli Duyuru (Kırmızı)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Başlık (Opsiyonel)</label>
                  <input
                    type="text"
                    value={props.title || ''}
                    placeholder="Örn: Önemli Duyuru"
                    onChange={(e) => handlePropChange('title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mesaj Metni</label>
                  <textarea
                    rows={3}
                    value={props.message || props.text || ''}
                    placeholder="Duyuru veya bildirim metni..."
                    onChange={(e) => handlePropChange('message', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Aksiyon Buton Metni</label>
                    <input
                      type="text"
                      value={props.actionText || ''}
                      placeholder="Başvuru Formu"
                      onChange={(e) => handlePropChange('actionText', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Aksiyon Linki</label>
                    <input
                      type="text"
                      value={props.actionUrl || ''}
                      placeholder="/basvuru"
                      onChange={(e) => handlePropChange('actionUrl', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={props.dismissible !== false}
                      onChange={(e) => handlePropChange('dismissible', e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700 font-semibold text-xs">Kullanıcı Tarafından Kapatılabilir (✕)</span>
                  </label>
                </div>
              </>
            )}

            {/* FlipBox Props */}
            {type === 'FlipBox' && (
              <>
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
                  <h4 className="font-bold text-purple-900 text-xs uppercase tracking-wider">Ön Yüz (Front)</h4>
                  <div>
                    <label className="block text-gray-600 text-xs mb-1">İkon / Emoji</label>
                    <input
                      type="text"
                      value={props.frontIcon || ''}
                      placeholder="🎹, 🥁, 🎨, ⭐"
                      onChange={(e) => handlePropChange('frontIcon', e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded bg-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-xs mb-1">Ön Başlık</label>
                    <input
                      type="text"
                      value={props.frontTitle || ''}
                      placeholder="Örn: Piyano & Ritim"
                      onChange={(e) => handlePropChange('frontTitle', e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded bg-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-xs mb-1">Ön Alt Başlık</label>
                    <input
                      type="text"
                      value={props.frontSubtitle || ''}
                      placeholder="Birebir Müzik Terapisi"
                      onChange={(e) => handlePropChange('frontSubtitle', e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded bg-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                  <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider">Arka Yüz (Back)</h4>
                  <div>
                    <label className="block text-gray-600 text-xs mb-1">Arka Başlık (Opsiyonel)</label>
                    <input
                      type="text"
                      value={props.backTitle || ''}
                      placeholder="Atölye Detayı"
                      onChange={(e) => handlePropChange('backTitle', e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded bg-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-xs mb-1">Arka Açıklama</label>
                    <textarea
                      rows={3}
                      value={props.backDescription || ''}
                      placeholder="Atölye hedefleri, kazanımlar..."
                      onChange={(e) => handlePropChange('backDescription', e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded bg-white text-xs outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-600 text-xs mb-1">Buton Metni</label>
                      <input
                        type="text"
                        value={props.buttonText || ''}
                        placeholder="İncele"
                        onChange={(e) => handlePropChange('buttonText', e.target.value)}
                        className="w-full px-2 py-1 border rounded bg-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-xs mb-1">Buton Linki</label>
                      <input
                        type="text"
                        value={props.buttonUrl || ''}
                        placeholder="#"
                        onChange={(e) => handlePropChange('buttonUrl', e.target.value)}
                        className="w-full px-2 py-1 border rounded bg-white text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <ColorPickerInput
                    label="Vurgu Rengi"
                    value={props.accentColor || '#FFB92C'}
                    onChange={(c) => handlePropChange('accentColor', c)}
                  />
                  <ColorPickerInput
                    label="Arka Yüz Rengi"
                    value={props.backBg || '#023E8A'}
                    onChange={(c) => handlePropChange('backBg', c)}
                  />
                </div>
              </>
            )}

            {/* GoogleMap Props */}
            {type === 'GoogleMap' && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Adres veya Konum Adı</label>
                  <input
                    type="text"
                    value={props.address || ''}
                    placeholder="Örn: ÇOMÜ Müzik ve Sahne Sanatları Fakültesi, Çanakkale"
                    onChange={(e) => handlePropChange('address', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Harita Başlığı (Opsiyonel)</label>
                  <input
                    type="text"
                    value={props.title || ''}
                    placeholder="Örn: Etkinlik ve Eğitim Kampüsü"
                    onChange={(e) => handlePropChange('title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Yükseklik (px)</label>
                    <input
                      type="number"
                      min="200"
                      max="800"
                      value={props.height || 380}
                      onChange={(e) => handlePropChange('height', parseInt(e.target.value, 10) || 380)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Yakınlaştırma (Zoom)</label>
                    <input
                      type="number"
                      min="8"
                      max="20"
                      value={props.zoom || 14}
                      onChange={(e) => handlePropChange('zoom', parseInt(e.target.value, 10) || 14)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Align setting for all */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Hizalama</label>
              <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg text-center">
                {(['left', 'center', 'right'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => handlePropChange('align', a)}
                    className={`py-1 rounded font-medium ${
                      props.align === a
                        ? 'bg-white shadow text-purple-700 font-bold'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {a === 'left' ? 'Sol' : a === 'center' ? 'Orta' : 'Sağ'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'styles' && (
          <div className="space-y-4">
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
              <h4 className="font-bold text-purple-900 mb-2 uppercase tracking-wider text-[11px]">
                Kutu Boyutları (Box Model)
              </h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-gray-600 mb-0.5">Genişlik (Width)</label>
                  <input
                    type="text"
                    placeholder="örn: 100%, 780px"
                    value={styles.width || ''}
                    onChange={(e) => handleStyleChange('width', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">Maksimum Genişlik (Max Width)</label>
                  <input
                    type="text"
                    placeholder="örn: 800px"
                    value={styles.maxWidth || ''}
                    onChange={(e) => handleStyleChange('maxWidth', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">Yükseklik (Height)</label>
                  <input
                    type="text"
                    placeholder="örn: auto, 300px"
                    value={styles.height || ''}
                    onChange={(e) => handleStyleChange('height', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">Minimum Yükseklik (Min Height)</label>
                  <input
                    type="text"
                    placeholder="örn: 240px, 50vh"
                    value={styles.minHeight || ''}
                    onChange={(e) => handleStyleChange('minHeight', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded bg-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-600 mb-0.5">İç Boşluk (Padding)</label>
                    <input
                      type="text"
                      placeholder="örn: 20px"
                      value={styles.padding || ''}
                      onChange={(e) => handleStyleChange('padding', e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-0.5">Dış Boşluk (Margin)</label>
                    <input
                      type="text"
                      placeholder="örn: 10px 0"
                      value={styles.margin || ''}
                      onChange={(e) => handleStyleChange('margin', e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded bg-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-2 uppercase tracking-wider text-[11px]">
                Görünüm & Renkler
              </h4>
              <div className="space-y-3">
                <ColorPickerInput
                  label="Arka Plan Rengi"
                  value={styles.backgroundColor}
                  onChange={(c) => handleStyleChange('backgroundColor', c)}
                />
                <ColorPickerInput
                  label="Metin Rengi"
                  value={styles.color}
                  onChange={(c) => handleStyleChange('color', c)}
                />
                <div>
                  <label className="block text-gray-600 mb-0.5">Kenarlık Yarıçapı (Border Radius)</label>
                  <input
                    type="text"
                    placeholder="örn: 16px, 9999px"
                    value={styles.borderRadius || ''}
                    onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">Gölge (Box Shadow)</label>
                  <input
                    type="text"
                    placeholder="örn: 0 10px 25px rgba(0,0,0,0.1)"
                    value={styles.boxShadow || ''}
                    onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded bg-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Typography Section */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-2 uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Tipografi & Yazı Tipi</span>
                <span className="text-[10px] text-purple-600 font-mono font-bold">Aa</span>
              </h4>
              <div className="space-y-3">
                {/* Font Family */}
                <div>
                  <label className="block text-gray-600 mb-1">Yazı Tipi Ailesi (Font Family)</label>
                  <select
                    value={styles.fontFamily || 'Poppins, sans-serif'}
                    onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white outline-none font-medium"
                  >
                    <option value="Poppins, sans-serif">Poppins (Modern & Sade)</option>
                    <option value="Inter, sans-serif">Inter (Temiz & Düz)</option>
                    <option value="Roboto, sans-serif">Roboto (Geometrik Sans)</option>
                    <option value="Montserrat, sans-serif">Montserrat (Güçlü Başlık)</option>
                    <option value="'Playfair Display', serif">Playfair Display (Zarif Serif)</option>
                    <option value="'Cinzel', serif">Cinzel (Klasik / Prestij)</option>
                    <option value="system-ui, sans-serif">Sistem Fontu (Varsayılan)</option>
                  </select>
                </div>

                {/* Font Size with Quick Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-gray-600">Yazı Boyutu (Font Size)</label>
                    <span className="text-[11px] font-mono font-bold text-purple-600">{styles.fontSize || '24px'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <input
                      type="text"
                      placeholder="örn: 24px"
                      value={styles.fontSize || ''}
                      onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white outline-none"
                    />
                  </div>
                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1">
                    {['12px', '14px', '16px', '18px', '20px', '24px', '32px', '40px', '48px', '56px'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleStyleChange('fontSize', sz)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border transition ${
                          styles.fontSize === sz
                            ? 'bg-purple-600 text-white border-purple-600 font-bold'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Weight */}
                <div>
                  <label className="block text-gray-600 mb-1">Yazı Kalınlığı (Font Weight)</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'İnce', val: 300 },
                      { label: 'Normal', val: 400 },
                      { label: 'Yarı', val: 600 },
                      { label: 'Kalın', val: 700 },
                    ].map((fw) => (
                      <button
                        key={fw.val}
                        type="button"
                        onClick={() => handleStyleChange('fontWeight', fw.val)}
                        className={`py-1 text-center rounded text-[10px] border transition ${
                          styles.fontWeight === fw.val || (fw.val === 700 && styles.fontWeight === 'bold')
                            ? 'bg-purple-600 text-white border-purple-600 font-bold'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {fw.label} ({fw.val})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Alignment */}
                <div>
                  <label className="block text-gray-600 mb-1">Metin Hizalama (Text Align)</label>
                  <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-lg border border-gray-200">
                    {[
                      { align: 'left', icon: '⇤', title: 'Sola' },
                      { align: 'center', icon: '⫿', title: 'Ortala' },
                      { align: 'right', icon: '⇥', title: 'Sağa' },
                      { align: 'justify', icon: '⇿', title: 'İki Yana' },
                    ].map((a) => (
                      <button
                        key={a.align}
                        type="button"
                        onClick={() => {
                          handleStyleChange('textAlign', a.align)
                          handlePropChange('align', a.align)
                        }}
                        className={`py-1 text-center rounded text-xs transition ${
                          styles.textAlign === a.align || props.align === a.align
                            ? 'bg-purple-600 text-white font-bold shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title={a.title}
                      >
                        {a.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Universal Media Picker Modal */}
      <MediaPickerModal
        isOpen={pickerConfig.isOpen}
        onClose={() => setPickerConfig((prev) => ({ ...prev, isOpen: false }))}
        onSelect={(media: MediaItem) => {
          handlePropChange(pickerConfig.targetKey, media.file_url)
          if (pickerConfig.targetKey === 'url' && type === 'Image' && media.alt_text) {
            handlePropChange('alt', media.alt_text)
          }
        }}
        siteSlug={siteSlug}
        token={token}
        allowedTypes={pickerConfig.allowedTypes}
        title={pickerConfig.title}
      />
    </aside>
  )
}
