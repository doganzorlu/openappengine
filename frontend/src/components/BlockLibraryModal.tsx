import React, { useState } from 'react'
import type { ComponentNode } from '../types'

interface BlockLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onInsertBlock: (block: ComponentNode) => void
  brandColor?: string
}

interface BlockTemplate {
  id: string
  category: 'hero' | 'features' | 'counters' | 'media' | 'faq' | 'form'
  title: string
  description: string
  previewIcon: string
  generateNode: (brandColor: string) => ComponentNode
}

export const BlockLibraryModal: React.FC<BlockLibraryModalProps> = ({
  isOpen,
  onClose,
  onInsertBlock,
  brandColor = '#4F46E5',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  if (!isOpen) return null

  const templates: BlockTemplate[] = [
    {
      id: 'hero-banner',
      category: 'hero',
      title: 'Modern Hero Banner',
      description: 'Görkemli ana başlık, açıklama metni, eylem butonu ve zarif dalga geçişi.',
      previewIcon: '🚀',
      generateNode: (col) => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: {
          minHeight: 520,
          bgColor: '#0F172A',
          shapeDividerBottom: {
            shape: 'mountains',
            color: '#ffffff',
            height: 60,
          },
        },
        styles: {
          padding: '90px 20px 110px 20px',
        },
        children: [
          {
            id: 'col_' + uniqid(),
            type: 'Column',
            props: { width: 100, align: 'center' },
            styles: {},
            children: [
              {
                id: 'h_' + uniqid(),
                type: 'Heading',
                props: {
                  text: 'Geleceğe Güvenle Adım Atın',
                  level: 'h1',
                  align: 'center',
                  color: '#FFFFFF',
                },
                styles: {},
              },
              {
                id: 't_' + uniqid(),
                type: 'RichText',
                props: {
                  html: '<p class="text-lg text-slate-300 max-w-2xl mx-auto my-5 text-center">Modern teknolojiler ve uzman kadromuzla hedeflerinize en hızlı şekilde ulaşın.</p>',
                  align: 'center',
                  color: '#CBD5E1',
                },
                styles: {},
              },
              {
                id: 'b_' + uniqid(),
                type: 'Button',
                props: {
                  text: 'Hemen Başlayın',
                  url: '#iletisim',
                  align: 'center',
                  bgColor: col,
                  color: '#FFFFFF',
                },
                styles: {},
              },
            ],
          },
        ],
      }),
    },
    {
      id: 'features-3col',
      category: 'features',
      title: '3 Sütunlu Özellikler & Hizmetler',
      description: 'Renkli ikonlar, başlıklar ve açıklama metinleri içeren modern kartlar.',
      previewIcon: '⭐',
      generateNode: (col) => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '70px 20px', backgroundColor: '#FFFFFF' },
        children: [
          {
            id: 'ib1_' + uniqid(),
            type: 'IconBox',
            props: {
              title: 'Uzman Kadro',
              description: 'Alanında deneyimli profesyoneller ile en üst düzeyde sonuçlar.',
              icon: 'fas fa-award',
              iconColor: col,
            },
            styles: {},
          },
          {
            id: 'ib2_' + uniqid(),
            type: 'IconBox',
            props: {
              title: 'Kesintisiz Destek',
              description: 'İhtiyaç duyduğunuz her an yanınızda olan 7/24 rehberlik.',
              icon: 'fas fa-headset',
              iconColor: col,
            },
            styles: {},
          },
          {
            id: 'ib3_' + uniqid(),
            type: 'IconBox',
            props: {
              title: 'Yüksek Memnuniyet',
              description: 'Yüzlerce mutlu danışan ve kanıtlanmış başarı hikayeleri.',
              icon: 'fas fa-heart',
              iconColor: col,
            },
            styles: {},
          },
        ],
      }),
    },
    {
      id: 'counters-4col',
      category: 'counters',
      title: 'Canlı İstatistik Sayaçları',
      description: 'Rakamlarla başarılarınızı sergileyen 4 sütunlu canlı sayaç bloğu.',
      previewIcon: '📊',
      generateNode: () => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '60px 20px', backgroundColor: '#F8FAFC' },
        children: [
          {
            id: 'c1_' + uniqid(),
            type: 'Counter',
            props: {
              endingNumber: 1500,
              startingNumber: 0,
              suffix: '+',
              title: 'Mutlu Danışan',
            },
            styles: {},
          },
          {
            id: 'c2_' + uniqid(),
            type: 'Counter',
            props: {
              endingNumber: 15,
              startingNumber: 0,
              suffix: '+ Yıl',
              title: 'Sektörel Tecrübe',
            },
            styles: {},
          },
          {
            id: 'c3_' + uniqid(),
            type: 'Counter',
            props: {
              endingNumber: 24,
              startingNumber: 0,
              suffix: '/7',
              title: 'Kesintisiz Destek',
            },
            styles: {},
          },
          {
            id: 'c4_' + uniqid(),
            type: 'Counter',
            props: {
              endingNumber: 99,
              startingNumber: 0,
              suffix: '%',
              title: 'Memnuniyet Oranı',
            },
            styles: {},
          },
        ],
      }),
    },
    {
      id: 'media-video',
      category: 'media',
      title: 'Video Tanıtım & Açıklama',
      description: 'Büyük boy responsive YouTube video oynatıcı ve bilgilendirme başlığı.',
      previewIcon: '🎬',
      generateNode: () => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '70px 20px', backgroundColor: '#FFFFFF' },
        children: [
          {
            id: 'col_v_' + uniqid(),
            type: 'Column',
            props: { width: 100, align: 'center' },
            styles: {},
            children: [
              {
                id: 'h_v_' + uniqid(),
                type: 'Heading',
                props: {
                  text: 'Bizi Yakından Tanıyın',
                  level: 'h2',
                  align: 'center',
                },
                styles: {},
              },
              {
                id: 'vid_' + uniqid(),
                type: 'Video',
                props: {
                  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  type: 'youtube',
                },
                styles: { margin: '20px auto', maxWidth: '800px' },
              },
            ],
          },
        ],
      }),
    },
    {
      id: 'faq-accordion',
      category: 'faq',
      title: 'Sıkça Sorulan Sorular (SSS)',
      description: 'Ziyaretçilerinizin merak ettiği sorular için açılır-kapanır akordiyon.',
      previewIcon: '❓',
      generateNode: () => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '70px 20px', backgroundColor: '#F8FAFC' },
        children: [
          {
            id: 'col_faq_' + uniqid(),
            type: 'Column',
            props: { width: 100 },
            styles: { maxWidth: '850px', margin: '0 auto' },
            children: [
              {
                id: 'h_faq_' + uniqid(),
                type: 'Heading',
                props: {
                  text: 'Sıkça Sorulan Sorular',
                  level: 'h2',
                  align: 'center',
                },
                styles: { margin: '0 0 30px 0' },
              },
              {
                id: 'acc_' + uniqid(),
                type: 'Accordion',
                props: {
                  items: [
                    {
                      id: uniqid(),
                      title: 'Hizmetlerinizden nasıl faydalanabilirim?',
                      content: 'İletişim formumuzu doldurarak veya doğrudan telefonla bize ulaşarak randevu alabilirsiniz.',
                    },
                    {
                      id: uniqid(),
                      title: 'Çalışma saatleriniz nedir?',
                      content: 'Hafta içi 09:00 - 18:00 saatleri arasında kesintisiz hizmet vermekteyiz.',
                    },
                    {
                      id: uniqid(),
                      title: 'Danışmanlık süreci nasıl işliyor?',
                      content: 'İlk değerlendirme görüşmesinin ardından size özel bir eylem planı oluşturulur.',
                    },
                  ],
                },
                styles: {},
              },
            ],
          },
        ],
      }),
    },
    {
      id: 'contact-section',
      category: 'form',
      title: 'İletişim & Başvuru Formu',
      description: 'Ziyaretçilerinizin doğrudan mesaj gönderebileceği dinamik iletişim alanı.',
      previewIcon: '📬',
      generateNode: () => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '80px 20px', backgroundColor: '#FFFFFF' },
        children: [
          {
            id: 'col_form_' + uniqid(),
            type: 'Column',
            props: { width: 100 },
            styles: { maxWidth: '650px', margin: '0 auto' },
            children: [
              {
                id: 'h_f_' + uniqid(),
                type: 'Heading',
                props: {
                  text: 'Bizimle İletişime Geçin',
                  level: 'h2',
                  align: 'center',
                },
                styles: { margin: '0 0 10px 0' },
              },
              {
                id: 't_f_' + uniqid(),
                type: 'RichText',
                props: {
                  html: '<p class="text-sm text-gray-500 text-center mb-6">Sorularınız, görüşleriniz veya randevu talepleriniz için bize yazın.</p>',
                  align: 'center',
                },
                styles: {},
              },
              {
                id: 'form_' + uniqid(),
                type: 'ContactForm',
                props: {
                  formId: 'contact-form',
                  title: 'Mesaj Gönderin',
                  buttonText: 'Mesajı Gönder',
                },
                styles: {},
              },
            ],
          },
        ],
      }),
    },
  ]

  const categories = [
    { id: 'all', label: 'Tüm Şablonlar', icon: '✨' },
    { id: 'hero', label: 'Hero Başlıklar', icon: '🚀' },
    { id: 'features', label: 'Hizmetler & Özellikler', icon: '⭐' },
    { id: 'counters', label: 'Sayaçlar', icon: '📊' },
    { id: 'media', label: 'Medya & Video', icon: '🎬' },
    { id: 'faq', label: 'Soru & Cevap', icon: '❓' },
    { id: 'form', label: 'İletişim & Form', icon: '📬' },
  ]

  const filtered = selectedCategory === 'all'
    ? templates
    : templates.filter((t) => t.category === selectedCategory)

  function uniqid() {
    return Math.random().toString(36).substring(2, 9)
  }

  const handleSelectTemplate = (t: BlockTemplate) => {
    const node = t.generateNode(brandColor)
    onInsertBlock(node)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-gray-800">
          <div>
            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <span>🧩</span> Blok & Bölüm Kütüphanesi
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Sayfanıza profesyonelce tasarlanmış hazır bir bölüm ekleyin.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedCategory === c.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-purple-500 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl p-2.5 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition">
                    {t.previewIcon}
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-purple-600 transition">
                      {t.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      {t.category}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  {t.description}
                </p>
              </div>

              <button
                onClick={() => handleSelectTemplate(t)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition"
              >
                <span>➕</span> Bu Bölümü Sayfaya Ekle
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
