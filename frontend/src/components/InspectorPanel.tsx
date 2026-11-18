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
  const [activeTab, setActiveTab] = useState<'props' | 'styles'>('props')
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
                <div>
                  <label className="block text-gray-600 mb-0.5">Yazı Boyutu (Font Size)</label>
                  <input
                    type="text"
                    placeholder="örn: 18px, 1.25rem"
                    value={styles.fontSize || ''}
                    onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded bg-white outline-none"
                  />
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
