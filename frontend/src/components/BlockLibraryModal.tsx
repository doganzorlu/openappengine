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
    {
      id: 'gallery-carousel',
      category: 'media',
      title: 'Fotoğraf Galerisi & Karusel',
      description: 'Ziyaretçilerin gezinebileceği otomatik geçişli çoklu görsel galerisi.',
      previewIcon: '🖼️',
      generateNode: (col) => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed', bgColor: '#F8F9FA' },
        styles: { padding: '60px 20px', backgroundColor: '#F8F9FA' },
        children: [
          {
            id: 'h_gal_' + uniqid(),
            type: 'Heading',
            props: {
              text: 'FOTOĞRAF GALERİSİ',
              level: 'h2',
              align: 'center',
              color: col || '#0077B6',
              withDivider: true,
            },
            styles: { textAlign: 'center', margin: '0 0 30px 0' },
          },
          {
            id: 'car_' + uniqid(),
            type: 'SlideCarousel',
            props: {
              slidesToShow: 3,
              autoplay: true,
            },
            styles: {},
            children: [
              {
                id: 'im_1_' + uniqid(),
                type: 'ImageBox',
                props: {
                  title: 'Etkinlik Fotoğrafı 1',
                  description: 'Galeri detayı ve açıklama metni.',
                  imageUrl: '',
                },
                styles: {},
              },
              {
                id: 'im_2_' + uniqid(),
                type: 'ImageBox',
                props: {
                  title: 'Etkinlik Fotoğrafı 2',
                  description: 'Galeri detayı ve açıklama metni.',
                  imageUrl: '',
                },
                styles: {},
              },
              {
                id: 'im_3_' + uniqid(),
                type: 'ImageBox',
                props: {
                  title: 'Etkinlik Fotoğrafı 3',
                  description: 'Galeri detayı ve açıklama metni.',
                  imageUrl: '',
                },
                styles: {},
              },
            ],
          },
        ],
      }),
    },
    {
      id: 'countdown-banner',
      category: 'counters',
      title: 'Geri Sayım & Lansman Sayacı',
      description: 'Etkinlik veya kayıt bitiş tarihine kadar kalan gün/saat/dakika/saniye sayacı.',
      previewIcon: '⏳',
      generateNode: (col) => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed', minHeight: 380, bgColor: '#0F172A' },
        styles: { padding: '60px 20px', backgroundColor: '#0F172A' },
        children: [
          {
            id: 'col_cd_' + uniqid(),
            type: 'Column',
            props: { width: 100, align: 'center' },
            styles: {},
            children: [
              {
                id: 'h_cd_' + uniqid(),
                type: 'Heading',
                props: {
                  text: 'VI. Otizm ve Müzik Yaz Okulu Başlıyor!',
                  level: 'h2',
                  align: 'center',
                  color: '#FFFFFF',
                },
                styles: { textAlign: 'center', margin: '0 0 10px 0' },
              },
              {
                id: 'cd_' + uniqid(),
                type: 'Countdown',
                props: {
                  targetDate: '2026-07-06T09:00:00',
                  title: 'Açılış Etkinliğine Kalan Süre',
                  completedText: 'Etkinlik Başladı!',
                  accentColor: col || '#FFB92C',
                  boxBg: '#1E293B',
                  textColor: '#FFFFFF',
                },
                styles: {},
              },
            ],
          },
        ],
      }),
    },
    {
      id: 'post-grid-section',
      category: 'media',
      title: 'Dinamik Güncel Yazılar & Duyurular',
      description: 'Sitedeki son blog yazılarını ve duyuruları otomatik çeken 3 sütunlu kart ızgarası.',
      previewIcon: '📰',
      generateNode: (col) => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '70px 20px', backgroundColor: '#FFFFFF' },
        children: [
          {
            id: 'col_pg_' + uniqid(),
            type: 'Column',
            props: { width: 100 },
            styles: {},
            children: [
              {
                id: 'h_pg_' + uniqid(),
                type: 'Heading',
                props: {
                  text: 'GÜNCEL YAZILAR & DUYURULAR',
                  level: 'h2',
                  align: 'center',
                  color: col || '#1E293B',
                  withDivider: true,
                },
                styles: { textAlign: 'center', margin: '0 0 30px 0' },
              },
              {
                id: 'pg_' + uniqid(),
                type: 'PostGrid',
                props: {
                  count: 3,
                  columns: 3,
                  showImage: true,
                  showDate: true,
                  showExcerpt: true,
                  readMoreText: 'Devamını Oku →',
                  accentColor: col || '#4F46E5',
                },
                styles: {},
              },
            ],
          },
        ],
      }),
    },
    {
      id: 'team-members-3col',
      category: 'features',
      title: 'Ekip & Kurul Üyeleri (3 Sütun)',
      description: 'Fotoğraflı, unvanlı, biyografili ve sosyal profilli modern uzman kadro kartları.',
      previewIcon: '👥',
      generateNode: (col) => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '70px 20px', backgroundColor: '#F8FAFC' },
        children: [
          {
            id: 'h_team_' + uniqid(),
            type: 'Heading',
            props: {
              text: 'DÜZENLEME & BİLİM KURULU',
              level: 'h2',
              align: 'center',
              color: col || '#023E8A',
              withDivider: true,
            },
            styles: { textAlign: 'center', margin: '0 0 30px 0' },
          },
          {
            id: 'col_t1_' + uniqid(),
            type: 'Column',
            props: { width: 33.3 },
            styles: {},
            children: [
              {
                id: 'tm_1_' + uniqid(),
                type: 'TeamMember',
                props: {
                  name: 'Prof. Dr. Uğur TÜRKMEN',
                  role: 'Düzenleme Kurulu Başkanı',
                  bio: 'Çanakkale Onsekiz Mart Üniversitesi MSSF Müdürü ve Otizm & Müzik Yaz Okulu Koordinatörü.',
                  imageUrl: '/storage/sites/otizmuzikokulu/media/2025/02/WhatsApp-Image-2023-02-27-at-02.47.17.jpeg',
                  socials: [
                    { type: 'web', url: 'https://otizmuzikokulu.org.tr' },
                    { type: 'email', url: 'mailto:bilgi@otizmuzikokulu.org.tr' },
                  ],
                  accentColor: col || '#4F46E5',
                },
                styles: {},
              },
            ],
          },
          {
            id: 'col_t2_' + uniqid(),
            type: 'Column',
            props: { width: 33.3 },
            styles: {},
            children: [
              {
                id: 'tm_2_' + uniqid(),
                type: 'TeamMember',
                props: {
                  name: 'Prof. Dr. Çiğdem EREKİNCİ',
                  role: 'Bilim Kurulu Üyesi',
                  bio: 'Farklı öğrenen bireylerde müzik eğitimi ve özel eğitim alanında bilimsel araştırmacı.',
                  imageUrl: '/storage/sites/otizmuzikokulu/media/2025/02/WhatsApp-Image-2021-12-26-at-22.41.17.jpeg',
                  socials: [
                    { type: 'linkedin', url: 'https://linkedin.com' },
                    { type: 'email', url: 'mailto:info@otizmuzikokulu.org.tr' },
                  ],
                  accentColor: col || '#4F46E5',
                },
                styles: {},
              },
            ],
          },
          {
            id: 'col_t3_' + uniqid(),
            type: 'Column',
            props: { width: 33.3 },
            styles: {},
            children: [
              {
                id: 'tm_3_' + uniqid(),
                type: 'TeamMember',
                props: {
                  name: 'Öğr. Gör. Tamer AKKAYA',
                  role: 'Eğitim & Atölye Sorumlusu',
                  bio: 'Ritim ve orff çalgıları ile müzik terapi çalışmalarında uzman eğitmen.',
                  imageUrl: '/storage/sites/otizmuzikokulu/media/2025/02/WhatsApp-Image-2021-12-26-at-22.41.17.jpeg',
                  socials: [
                    { type: 'instagram', url: 'https://instagram.com' },
                    { type: 'email', url: 'mailto:info@otizmuzikokulu.org.tr' },
                  ],
                  accentColor: col || '#4F46E5',
                },
                styles: {},
              },
            ],
          },
        ],
      }),
    },
    {
      id: 'sponsor-logo-ticker',
      category: 'media',
      title: 'Sponsor & Destekçi Logoları (Kayan Bant)',
      description: 'Destekçiler, iş ortakları ve üniversite logolarının kesintisiz aktığı sonsuz bant.',
      previewIcon: '🤝',
      generateNode: () => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'full' },
        styles: { padding: '40px 0', backgroundColor: '#FFFFFF' },
        children: [
          {
            id: 'h_sp_' + uniqid(),
            type: 'Heading',
            props: {
              text: 'DESTEKLEYEN KURUMLAR & PAYDAŞLAR',
              level: 'h3',
              align: 'center',
              color: '#64748B',
            },
            styles: { textAlign: 'center', margin: '0 0 10px 0', fontSize: '13px', letterSpacing: '0.15em' },
          },
          {
            id: 'ticker_' + uniqid(),
            type: 'LogoTicker',
            props: {
              speed: 'normal',
              grayscale: true,
              pauseOnHover: true,
              direction: 'left',
              logos: [
                { id: '1', name: 'Çanakkale Onsekiz Mart Üniversitesi', imageUrl: '/storage/sites/otizmuzikokulu/media/2025/02/omyo_logo.png' },
                { id: '2', name: 'Müzik ve Sahne Sanatları Fakültesi', imageUrl: '/storage/sites/otizmuzikokulu/media/2025/02/omyo_logo.png' },
                { id: '3', name: 'Otizm Konfederasyonu', imageUrl: '/storage/sites/otizmuzikokulu/media/2025/02/omyo_logo.png' },
                { id: '4', name: 'ODER Otizm Derneği', imageUrl: '/storage/sites/otizmuzikokulu/media/2025/02/omyo_logo.png' },
              ],
            },
            styles: {},
          },
        ],
      }),
    },
    {
      id: 'documents-download',
      category: 'media',
      title: 'PDF & Doküman İndirme Bloğu',
      description: 'Önemli PDF formları, kılavuzlar veya belgeler için şık indirme kartları.',
      previewIcon: '📄',
      generateNode: () => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '60px 20px', backgroundColor: '#FFFFFF' },
        children: [
          {
            id: 'h_doc_' + uniqid(),
            type: 'Heading',
            props: {
              text: 'BELGELER & DOKÜMANLAR',
              level: 'h2',
              align: 'left',
              withDivider: true,
            },
            styles: { margin: '0 0 25px 0' },
          },
          {
            id: 'dl_list_' + uniqid(),
            type: 'DownloadsList',
            props: {
              category: 'otobusler',
              title: 'İndirilebilir Dosyalar',
            },
            styles: {},
          },
        ],
      }),
    },
    {
      id: 'pricing-donation-3col',
      category: 'features',
      title: 'Bağış & Katılım Paketleri (3 Sütun)',
      description: 'Vakıf ve dernekler için burs, eğitim ve sponsorluk paketleri fiyatlandırma tablosu.',
      previewIcon: '💎',
      generateNode: (col) => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '70px 20px', backgroundColor: '#F8FAFC' },
        children: [
          {
            id: 'h_price_' + uniqid(),
            type: 'Heading',
            props: {
              text: 'DESTEK & BAĞIŞ PAKETLERİ',
              level: 'h2',
              align: 'center',
              color: col || '#023E8A',
              withDivider: true,
            },
            styles: { textAlign: 'center', margin: '0 0 35px 0' },
          },
          {
            id: 'col_p1_' + uniqid(),
            type: 'Column',
            props: { width: 33.3 },
            styles: {},
            children: [
              {
                id: 'pt_1_' + uniqid(),
                type: 'PricingTable',
                props: {
                  title: 'Öğrenci Müzik Desteği',
                  price: '500 ₺',
                  period: '/ aylık',
                  description: 'Bir öğrencimizin müzik terapisi ders materyallerine katkı sağlayın.',
                  isFeatured: false,
                  features: [
                    { text: 'Eğitim materyali temini', included: true },
                    { text: 'Aylık gelişim raporu', included: true },
                    { text: 'Dijital teşekkür sertifikası', included: true },
                    { text: 'Konser özel davetiyesi', included: false },
                  ],
                  buttonText: 'Düzenli Destek Ol',
                  buttonUrl: '#',
                  accentColor: col || '#023E8A',
                },
                styles: {},
              },
            ],
          },
          {
            id: 'col_p2_' + uniqid(),
            type: 'Column',
            props: { width: 33.3 },
            styles: {},
            children: [
              {
                id: 'pt_2_' + uniqid(),
                type: 'PricingTable',
                props: {
                  title: 'Tam Eğitim Bursu',
                  price: '1.500 ₺',
                  period: '/ aylık',
                  description: 'Bir otizmli gencimizin tüm yaz okulu müzik eğitimini üstlenin.',
                  badge: 'En Çok Tercih Edilen',
                  isFeatured: true,
                  features: [
                    { text: 'Birebir çalgı & ritim eğitimi', included: true },
                    { text: 'Psikososyal destek seansları', included: true },
                    { text: 'Yıl sonu konserinde sahne', included: true },
                    { text: 'Bursiyer ile tanışma etkinliği', included: true },
                  ],
                  buttonText: 'Burs Verin →',
                  buttonUrl: '#',
                  accentColor: col || '#4F46E5',
                },
                styles: {},
              },
            ],
          },
          {
            id: 'col_p3_' + uniqid(),
            type: 'Column',
            props: { width: 33.3 },
            styles: {},
            children: [
              {
                id: 'pt_3_' + uniqid(),
                type: 'PricingTable',
                props: {
                  title: 'Atölye Sponsorluğu',
                  price: '5.000 ₺',
                  period: '/ tek seferlik',
                  description: 'Orff çalgıları ve ritim terapi atölyemizin çalgı setini donatın.',
                  isFeatured: false,
                  features: [
                    { text: 'Tüm çalgı setine isim plaketi', included: true },
                    { text: 'Web sitesi ana sayfa sponsor logosu', included: true },
                    { text: 'Basın bülteninde teşekkür', included: true },
                    { text: 'Özel plaket takdimi', included: true },
                  ],
                  buttonText: 'Sponsor Olun',
                  buttonUrl: '#',
                  accentColor: col || '#023E8A',
                },
                styles: {},
              },
            ],
          },
        ],
      }),
    },
    {
      id: 'testimonials-2col',
      category: 'features',
      title: 'Veli & Katılımcı Görüşleri (Referanslar)',
      description: 'Yıldız puanlı, fotoğraflı ve alıntılı gerçek deneyim ve güven kartları.',
      previewIcon: '💬',
      generateNode: (col) => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '70px 20px', backgroundColor: '#FFFFFF' },
        children: [
          {
            id: 'h_test_' + uniqid(),
            type: 'Heading',
            props: {
              text: 'AİLELERİMİZ VE EĞİTMENLERİMİZ NE DİYOR?',
              level: 'h2',
              align: 'center',
              color: col || '#1E293B',
              withDivider: true,
            },
            styles: { textAlign: 'center', margin: '0 0 35px 0' },
          },
          {
            id: 'col_tm1_' + uniqid(),
            type: 'Column',
            props: { width: 50 },
            styles: {},
            children: [
              {
                id: 'tcard_1_' + uniqid(),
                type: 'Testimonial',
                props: {
                  name: 'Zeynep Kaya',
                  role: 'Öğrenci Velisi, Çanakkale',
                  quote: 'Oğlumuz piyano ve ritim derslerine başladıktan sonra odaklanma süresi belirgin şekilde arttı. Eğitmenlerin şefkati ve ilgisi paha biçilemez.',
                  rating: 5,
                  imageUrl: '',
                  accentColor: '#F59E0B',
                },
                styles: {},
              },
            ],
          },
          {
            id: 'col_tm2_' + uniqid(),
            type: 'Column',
            props: { width: 50 },
            styles: {},
            children: [
              {
                id: 'tcard_2_' + uniqid(),
                type: 'Testimonial',
                props: {
                  name: 'Dr. Ahmet Yılmaz',
                  role: 'Özel Eğitim Danışmanı',
                  quote: 'Otizm ve Müzik Yaz Okulu modeli, Türkiye genelinde farklı öğrenen bireylerin sosyal uyumunda örnek gösterilecek bilimsel bir başarı hikayesidir.',
                  rating: 5,
                  imageUrl: '',
                  accentColor: '#F59E0B',
                },
                styles: {},
              },
            ],
          },
        ],
      }),
    },
    {
      id: 'campaign-progress-banner',
      category: 'counters',
      title: 'Kampanya & Hedef İlerleme Çubuğu',
      description: 'Bağış hedefi veya kontenjan doluluk oranını gösteren şık ilerleme çubuğu.',
      previewIcon: '📈',
      generateNode: (col) => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '50px 20px', backgroundColor: '#F0FDF4' },
        children: [
          {
            id: 'col_prg_' + uniqid(),
            type: 'Column',
            props: { width: 100, align: 'center' },
            styles: {},
            children: [
              {
                id: 'h_prg_' + uniqid(),
                type: 'Heading',
                props: {
                  text: '2026 Yaz Okulu Öğrenci Burs Fonu',
                  level: 'h3',
                  align: 'center',
                  color: col || '#166534',
                },
                styles: { textAlign: 'center', margin: '0 0 10px 0' },
              },
              {
                id: 'prg_' + uniqid(),
                type: 'ProgressBar',
                props: {
                  label: 'Toplanan Burs Fonu (Hedef: 250.000 ₺)',
                  percentage: 78,
                  valueText: '195.000 ₺ (%78 Tamamlandı)',
                  barColor: col || '#10B981',
                  trackBg: '#DCFCE7',
                  height: 20,
                  showStripes: true,
                  textColor: '#14532D',
                },
                styles: {},
              },
            ],
          },
        ],
      }),
    },
    {
      id: 'faq-accordion-section',
      category: 'faq',
      title: 'Sıkça Sorulan Sorular (Modern Akordeon)',
      description: 'Açılır-kapanır panellerle katılım şartları, ücretler ve sıkça sorulan sorular.',
      previewIcon: '❓',
      generateNode: (col) => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '70px 20px', backgroundColor: '#FFFFFF' },
        children: [
          {
            id: 'col_faq_' + uniqid(),
            type: 'Column',
            props: { width: 100 },
            styles: {},
            children: [
              {
                id: 'h_faq_' + uniqid(),
                type: 'Heading',
                props: {
                  text: 'SIKÇA SORULAN SORULAR',
                  level: 'h2',
                  align: 'center',
                  color: col || '#1E293B',
                  withDivider: true,
                },
                styles: { textAlign: 'center', margin: '0 0 30px 0' },
              },
              {
                id: 'faq_' + uniqid(),
                type: 'Accordion',
                props: {
                  allowMultiple: false,
                  accentColor: col || '#4F46E5',
                  items: [
                    {
                      id: 'f1',
                      title: 'Yaz Okuluna kimler başvurabilir?',
                      content: '<p>Otizm spektrum bozukluğu tanısı almış, müzik ve ritim çalışmalarına ilgi duyan tüm yaş gruplarından çocuklar ve gençler velileriyle birlikte başvurabilir.</p>',
                    },
                    {
                      id: 'f2',
                      title: 'Eğitimler nerede ve ne zaman gerçekleştiriliyor?',
                      content: '<p>Eğitimler Çanakkale Onsekiz Mart Üniversitesi Müzik ve Sahne Sanatları Fakültesi bünyesinde, her yıl Temmuz ayında 5 gün boyunca tam gün olarak yapılmaktadır.</p>',
                    },
                    {
                      id: 'f3',
                      title: 'Burs ve indirim imkanı var mı?',
                      content: '<p>Evet. Destekçi kurumlarımız ve bağışçılarımız sayesinde maddi imkanı kısıtlı ailelerimize tam ve kısmi eğitim bursları sağlanmaktadır.</p>',
                    },
                    {
                      id: 'f4',
                      title: 'Program sonunda katılım belgesi veriliyor mu?',
                      content: '<p>Evet, programı başarıyla tamamlayan tüm katılımcılara üniversite ve dernek onaylı resmi katılım sertifikası takdim edilir.</p>',
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
      id: 'program-schedule-tabs',
      category: 'features',
      title: 'Etkinlik & Günlük Program (Sekmeli Panel)',
      description: 'Günlük etkinlik ve atölye takvimini sekmelerle şık bir şekilde sunar.',
      previewIcon: '📑',
      generateNode: (col) => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '70px 20px', backgroundColor: '#F8FAFC' },
        children: [
          {
            id: 'col_tabs_' + uniqid(),
            type: 'Column',
            props: { width: 100 },
            styles: {},
            children: [
              {
                id: 'h_tabs_' + uniqid(),
                type: 'Heading',
                props: {
                  text: 'GÜNLÜK ATÖLYE & ETKİNLİK PROGRAMI',
                  level: 'h2',
                  align: 'center',
                  color: col || '#023E8A',
                  withDivider: true,
                },
                styles: { textAlign: 'center', margin: '0 0 30px 0' },
              },
              {
                id: 'tabs_comp_' + uniqid(),
                type: 'Tabs',
                props: {
                  tabStyle: 'pills',
                  accentColor: col || '#023E8A',
                  tabs: [
                    {
                      id: 't1',
                      title: '1. Gün: Açılış & Oryantasyon',
                      content: '<p><strong>09:30 - 11:00</strong> Açılış Töreni ve Protokol Konuşmaları<br/><strong>11:30 - 13:00</strong> Bireysel Ses ve Ritim Değerlendirmeleri<br/><strong>14:00 - 16:30</strong> Tanışma Çemberi ve Müzik Oyunları</p>',
                    },
                    {
                      id: 't2',
                      title: '2. Gün: Ritim & Orff Atölyeleri',
                      content: '<p><strong>09:30 - 12:00</strong> Vurmalı Çalgılar ile Grup Dinamiği Çalışması<br/><strong>13:30 - 15:30</strong> Piyano ve Melodika Birebir Seansları<br/><strong>16:00 - 17:00</strong> Veli Bilgilendirme ve Deneyim Paylaşım Çemberi</p>',
                    },
                    {
                      id: 't3',
                      title: '3. Gün: Büyük Kapanış Konseri',
                      content: '<p><strong>10:00 - 12:30</strong> Sahne Provası ve Işık-Ses Düzenlemeleri<br/><strong>14:30 - 16:30</strong> Tüm Katılımcıların Yer Aldığı Gala Konseri ve Sertifika Töreni</p>',
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
      id: 'cta-hero-banner',
      category: 'hero',
      title: 'Eylem Çağrısı & Başvuru Kutusu (CTA)',
      description: 'Ziyaretçileri başvuruya veya bağışa yönlendiren yüksek dönüşümlü vurgulu kutu.',
      previewIcon: '📣',
      generateNode: (col) => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '50px 20px', backgroundColor: '#F8FAFC' },
        children: [
          {
            id: 'col_cta_' + uniqid(),
            type: 'Column',
            props: { width: 100 },
            styles: {},
            children: [
              {
                id: 'cta_comp_' + uniqid(),
                type: 'CallToAction',
                props: {
                  subtitle: 'GELECEĞE BİRLİKTE NOTA BIRAKALIM',
                  title: 'VI. Otizm ve Müzik Yaz Okulu Kayıtları Başladı!',
                  description: 'Çocuğunuzun müziğin iyileştirici ve birleştirici gücüyle tanışması için kontenjanlar dolmadan hemen başvurunuzu tamamlayın.',
                  buttonText: 'Hemen Başvuru Yap',
                  buttonUrl: '/basvuru',
                  secondaryButtonText: 'Burs Detaylarını İncele',
                  secondaryButtonUrl: '#',
                  accentColor: col || '#FFB92C',
                  bgColor: '#0F172A',
                  textColor: '#FFFFFF',
                  layout: 'centered',
                },
                styles: {},
              },
            ],
          },
        ],
      }),
    },
    {
      id: 'alert-notice-box',
      category: 'features',
      title: 'Önemli Duyuru & Bildirim Kutusu',
      description: 'Ziyaretçilerin dikkatini çeken renkli ve kapatılabilir bildirim bandı.',
      previewIcon: '🔔',
      generateNode: () => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '30px 20px', backgroundColor: '#FFFFFF' },
        children: [
          {
            id: 'col_alert_' + uniqid(),
            type: 'Column',
            props: { width: 100 },
            styles: {},
            children: [
              {
                id: 'alert_comp_' + uniqid(),
                type: 'AlertBox',
                props: {
                  alertType: 'urgent',
                  title: 'Önemli Hatırlatma: Erken Kayıt Dönemi Devam Ediyor',
                  message: '2026 Otizm ve Müzik Yaz Okulu kontenjanlarımız sınırlıdır. Ön kayıt formunu dolduran ilk 30 öğrencimize burs önceliği verilecektir.',
                  dismissible: true,
                  actionText: 'Ön Kayıt Formuna Git',
                  actionUrl: '/basvuru',
                },
                styles: {},
              },
            ],
          },
        ],
      }),
    },
    {
      id: 'flipbox-features-3col',
      category: 'features',
      title: '3D Dönen Atölye Kartları (3 Sütun)',
      description: 'Üzerine gelindiğinde 3D dönerek detaylı bilgi ve buton sunan interaktif kartlar.',
      previewIcon: '🔄',
      generateNode: (col) => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '70px 20px', backgroundColor: '#F8FAFC' },
        children: [
          {
            id: 'h_fb_' + uniqid(),
            type: 'Heading',
            props: {
              text: 'UZMANLIK VE EĞİTİM ATÖLYELERİMİZ',
              level: 'h2',
              align: 'center',
              color: col || '#023E8A',
              withDivider: true,
            },
            styles: { textAlign: 'center', margin: '0 0 35px 0' },
          },
          {
            id: 'col_fb1_' + uniqid(),
            type: 'Column',
            props: { width: 33.3 },
            styles: {},
            children: [
              {
                id: 'fb_1_' + uniqid(),
                type: 'FlipBox',
                props: {
                  frontIcon: '🎹',
                  frontTitle: 'Piyano & Tuşlular',
                  frontSubtitle: 'Birebir Çalgı Eğitimi',
                  frontBg: '#FFFFFF',
                  frontTextColor: '#1E293B',
                  backTitle: 'Piyano Terapisi',
                  backDescription: 'İki el koordinasyonu, parmak kasları ve melodi işleme kapasitesini geliştiren bireysel çalışma.',
                  buttonText: 'Müfredatı Gör',
                  buttonUrl: '#',
                  backBg: '#023E8A',
                  backTextColor: '#FFFFFF',
                  accentColor: col || '#FFB92C',
                },
                styles: {},
              },
            ],
          },
          {
            id: 'col_fb2_' + uniqid(),
            type: 'Column',
            props: { width: 33.3 },
            styles: {},
            children: [
              {
                id: 'fb_2_' + uniqid(),
                type: 'FlipBox',
                props: {
                  frontIcon: '🥁',
                  frontTitle: 'Ritim & Orff',
                  frontSubtitle: 'Grup Dinamiği & Terapi',
                  frontBg: '#FFFFFF',
                  frontTextColor: '#1E293B',
                  backTitle: 'Ritim Çemberi',
                  backDescription: 'Beden perküsyonu ve vurmalı çalgılarla dikkat süresini artıran eğlenceli grup etkinlikleri.',
                  buttonText: 'Müfredatı Gör',
                  buttonUrl: '#',
                  backBg: '#4F46E5',
                  backTextColor: '#FFFFFF',
                  accentColor: '#FFB92C',
                },
                styles: {},
              },
            ],
          },
          {
            id: 'col_fb3_' + uniqid(),
            type: 'Column',
            props: { width: 33.3 },
            styles: {},
            children: [
              {
                id: 'fb_3_' + uniqid(),
                type: 'FlipBox',
                props: {
                  frontIcon: '🎤',
                  frontTitle: 'Koro & Birlikte Söyleme',
                  frontSubtitle: 'Ses & İfade Gelişimi',
                  frontBg: '#FFFFFF',
                  frontTextColor: '#1E293B',
                  backTitle: 'Koro Atölyesi',
                  backDescription: 'Doğru nefes alma, konuşma artikülasyonu ve sosyal aidiyet duygusunu güçlendiren şarkı çalışmaları.',
                  buttonText: 'Müfredatı Gör',
                  buttonUrl: '#',
                  backBg: '#0D9488',
                  backTextColor: '#FFFFFF',
                  accentColor: '#FFB92C',
                },
                styles: {},
              },
            ],
          },
        ],
      }),
    },
    {
      id: 'location-map-section',
      category: 'features',
      title: 'Etkileşimli Konum & Ulaşım Haritası',
      description: 'Ziyaretçiler ve veliler için kampüs/merkez haritası.',
      previewIcon: '📍',
      generateNode: (col) => ({
        id: 'sec_' + uniqid(),
        type: 'Section',
        props: { layout: 'boxed' },
        styles: { padding: '60px 20px', backgroundColor: '#FFFFFF' },
        children: [
          {
            id: 'col_map_' + uniqid(),
            type: 'Column',
            props: { width: 100 },
            styles: {},
            children: [
              {
                id: 'h_map_' + uniqid(),
                type: 'Heading',
                props: {
                  text: 'EĞİTİM YERİ VE ULAŞIM',
                  level: 'h2',
                  align: 'center',
                  color: col || '#1E293B',
                  withDivider: true,
                },
                styles: { textAlign: 'center', margin: '0 0 25px 0' },
              },
              {
                id: 'map_comp_' + uniqid(),
                type: 'GoogleMap',
                props: {
                  address: 'Çanakkale Onsekiz Mart Üniversitesi Müzik ve Sahne Sanatları Fakültesi',
                  height: 400,
                  zoom: 15,
                  title: 'ÇOMÜ Terzioğlu Yerleşkesi, Çanakkale',
                  borderRadius: 24,
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
