import React from 'react'
import type { ComponentNode, Site, Menu } from '../types'
import { Timeline } from './Timeline'
import { ImageAccordion } from './ImageAccordion'
import { ContactForm } from './ContactForm'
import { Counter } from './Counter'
import { ImageCarousel } from './ImageCarousel'
import { Accordion } from './Accordion'
import { ImageBox, normalizeMediaUrl } from './ImageBox'
import { IconList } from './IconList'
import { DownloadsList } from './DownloadsList'
import { Tabs } from './Tabs'
import { SlideCarousel } from './SlideCarousel'
import { OrgChart } from './OrgChart'
import { ResizeHandles } from './ResizeHandles'
import { Countdown } from './Countdown'
import { PostGrid } from './PostGrid'
import { TeamMember } from './TeamMember'
import { LogoTicker } from './LogoTicker'
import { PricingTable } from './PricingTable'
import { Testimonial } from './Testimonial'
import { ProgressBar } from './ProgressBar'
import { CallToAction } from './CallToAction'
import { AlertBox } from './AlertBox'
import { FlipBox } from './FlipBox'
import { GoogleMap } from './GoogleMap'
import { AudioPlayer } from './AudioPlayer'
import { BeforeAfter } from './BeforeAfter'
import { VideoModal } from './VideoModal'
import { FilterableGallery } from './FilterableGallery'
import { FloatingContact } from './FloatingContact'
import { NewsletterBox } from './NewsletterBox'
import { SocialIcons } from './SocialIcons'
import { AnimatedHeadline } from './AnimatedHeadline'
import { DonutChart } from './DonutChart'

interface RendererProps {
  nodes: ComponentNode[]
  siteSlug: string
  site?: Site | null
  menus?: Menu[]
  isEditing?: boolean
  selectedNodeId?: string | null
  onSelectNode?: (node: ComponentNode) => void
  onUpdateNode?: (updatedNode: ComponentNode) => void
  isTopLevel?: boolean
  inGrid?: boolean
  onMoveNode?: (nodeId: string, direction: 'up' | 'down') => void
  onDuplicateNode?: (nodeId: string) => void
  onDeleteNode?: (nodeId: string) => void
  onAddBlockAtIndex?: (index: number) => void
}

export const ComponentRenderer: React.FC<RendererProps> = ({
  nodes,
  siteSlug,
  site = null,
  menus = [],
  isEditing = false,
  selectedNodeId = null,
  onSelectNode,
  onUpdateNode,
  isTopLevel = false,
  inGrid = false,
  onMoveNode,
  onDuplicateNode,
  onDeleteNode,
  onAddBlockAtIndex,
}) => {
  if (!nodes || !Array.isArray(nodes)) return null

  return (
    <>
      {nodes.map((node, index) => (
        <React.Fragment key={node.id}>
          {/* Section Divider with Quick Add trigger (Visible in Editor Mode for top level) */}
          {isEditing && isTopLevel && (
            <div className="relative group/divider py-1.5 flex items-center justify-center my-1 z-30">
              <div className="absolute inset-x-0 h-[2px] bg-purple-300 opacity-0 group-hover/divider:opacity-100 transition-opacity" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddBlockAtIndex && onAddBlockAtIndex(index)
                }}
                className="relative px-3 py-1 bg-white hover:bg-purple-600 hover:text-white text-purple-600 border border-purple-300 rounded-full text-xs font-semibold shadow-sm opacity-0 group-hover/divider:opacity-100 transition-all flex items-center gap-1.5 transform hover:scale-105"
                title="Araya Yeni Bölüm Ekle"
              >
                <span>➕</span> Araya Bölüm Ekle
              </button>
            </div>
          )}

          {(() => {
            const isMobileHidden = node.props?.hideMobile || node.id === 'c568d68'
            const isDesktopHidden = node.props?.hideDesktop || node.id === '3f78df5'
            const responsiveClass = isMobileHidden ? 'hidden md:block' : isDesktopHidden ? 'block md:hidden' : ''

            const widthVal = typeof node.props?.width === 'number' ? node.props.width : parseFloat(node.props?.width || '100')
            const isCenteredCol = node.type === 'Column' && (
              node.props?.align === 'center' ||
              node.props?.justifyContent === 'center' ||
              node.styles?.textAlign === 'center' ||
              node.styles?.animation === 'zoomIn' ||
              node.styles?.backgroundColor === '#1A1A1A70' ||
              node.id === '3c904e7'
            )
            const marginClass = isCenteredCol ? 'mx-auto' : ''

            const isHeaderCol =
              node.children &&
              node.children.some((c: any) => c.type === 'NavMenu' || c.type === 'SiteLogo')

            const isFooterCol =
              !isHeaderCol &&
              (node.id === 'e69091a' ||
                node.id === '161f785' ||
                node.id === '42904ea' ||
                (node.children &&
                  node.children.some((c: any) => c.type === 'IconList') &&
                  !node.children.some((c: any) => c.type === 'NavMenu')))

            const isCenterFooterCol =
              !isHeaderCol &&
              (node.id === '161f785' ||
                (node.children && node.children.some((c: any) => c.type === 'IconList')))
            const footerColBorder = isCenterFooterCol ? 'md:border-x md:border-white/20' : ''

            const colWidthClass = inGrid
              ? 'w-full h-full'
              : isFooterCol
              ? `w-full md:w-1/3 px-4 sm:px-6 text-center ${footerColBorder}`
              : node.type === 'Column'
              ? (widthVal <= 26 ? 'w-full md:w-1/4'
                : widthVal <= 34 ? 'w-full md:flex-1 md:min-w-[260px] md:max-w-[380px]'
                : widthVal <= 52 ? 'w-full md:flex-1 md:min-w-[320px]'
                : widthVal <= 68 ? 'w-full md:w-2/3'
                : widthVal <= 76 ? 'w-full md:w-3/4'
                : 'w-full')
              : 'w-full'

            return (
              <div className={`relative group/section ${colWidthClass} ${marginClass} ${responsiveClass}`}>
                {/* Top-Level Section Action Floating Bar */}
                {isEditing && isTopLevel && (
                  <div className="absolute top-2 right-4 z-30 flex items-center gap-1 bg-gray-900/90 text-white backdrop-blur-md px-2 py-1 rounded-xl shadow-xl text-xs border border-gray-700 opacity-90 group-hover/section:opacity-100 transition">
                    <span className="text-[10px] text-gray-400 font-mono font-bold px-1.5 border-r border-gray-700">
                      #{index + 1} {node.type}
                    </span>

                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation()
                        onMoveNode && onMoveNode(node.id, 'up')
                      }}
                      className="p-1 hover:bg-gray-800 rounded disabled:opacity-30 disabled:hover:bg-transparent transition"
                      title="Yukarı Taşı"
                    >
                      ⬆️
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === nodes.length - 1}
                      onClick={(e) => {
                        e.stopPropagation()
                        onMoveNode && onMoveNode(node.id, 'down')
                      }}
                      className="p-1 hover:bg-gray-800 rounded disabled:opacity-30 disabled:hover:bg-transparent transition"
                      title="Aşağı Taşı"
                    >
                      ⬇️
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDuplicateNode && onDuplicateNode(node.id)
                      }}
                      className="p-1 hover:bg-gray-800 rounded transition"
                      title="Bölümü Çoğalt"
                    >
                      📋
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteNode && onDeleteNode(node.id)
                      }}
                      className="p-1 hover:bg-red-900/60 text-red-400 rounded transition"
                      title="Bölümü Sil"
                    >
                      🗑️
                    </button>
                  </div>
                )}

                <NodeItem
                  node={node}
                  siteSlug={siteSlug}
                  site={site}
                  menus={menus}
                  isEditing={isEditing}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  onUpdateNode={onUpdateNode}
                  onDuplicateNode={onDuplicateNode}
                  onDeleteNode={onDeleteNode}
                />
              </div>
            )
          })()}
        </React.Fragment>
      ))}

      {/* Bottom Add Section Card in Visual Editor */}
      {isEditing && isTopLevel && (
        <div className="py-8 px-4 flex justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl mx-4 sm:mx-8 my-8 hover:border-purple-500 hover:bg-purple-50/40 transition group">
          <button
            type="button"
            onClick={() => onAddBlockAtIndex && onAddBlockAtIndex(nodes.length)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2 group-hover:scale-105"
          >
            <span>🧩</span> Hazır Blok Kütüphanesinden Bölüm Ekle
          </button>
        </div>
      )}
    </>
  )
}

function renderFormattedText(text: string | undefined | null) {
  if (!text) return null
  if (!text.includes('<br') && !text.includes('\n')) {
    return text
  }
  const lines = text.replace(/<br\s*\/?>/gi, '\n').split('\n')
  return lines.map((line, idx) => (
    <React.Fragment key={idx}>
      {idx > 0 && <br />}
      {line}
    </React.Fragment>
  ))
}

function getYoutubeEmbedUrl(url: string): string {
  if (!url) return ''
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  const id = match && match[2].length === 11 ? match[2] : null
  if (id) {
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&iv_load_policy=3&disablekb=1`
  }
  return url
}

const ShapeDivider: React.FC<{
  shape?: string
  position: 'top' | 'bottom'
  color: string
  height?: number
}> = ({ shape = 'mountains', position, color, height = 57 }) => {
  const isBottom = position === 'bottom'
  const shapeType = (shape || 'mountains').toLowerCase()

  const renderShapeSvg = () => {
    switch (shapeType) {
      case 'drops':
      case 'drops-negative':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 283.5 27.8"
            preserveAspectRatio="none"
            className="relative block w-full h-full"
            style={{ fill: color }}
          >
            <path d="M0 0v1.4c.6.7 1.1 1.4 1.4 2 2 3.8 2.2 6.6 1.8 10.8-.3 3.3-2.4 9.4 0 12.3 1.7 2 3.7 1.4 4.6-.9 1.4-3.8-.7-8.2-.6-12 .1-3.7 3.2-5.5 6.9-4.9 4 .6 4.8 4 4.9 7.4.1 1.8-1.1 7 0 8.5.6.8 1.6 1.2 2.4.5 1.4-1.1.1-5.4.1-6.9.1-3.7.3-8.6 4.1-10.5 5-2.5 6.2 1.6 5.4 5.6-.4 1.7-1 9.2 2.9 6.3 1.5-1.1.7-3.5.5-4.9-.4-2.4-.4-4.3 1-6.5.9-1.4 2.4-3.1 4.2-3 2.4.1 2.7 2.2 4 3.7 1.5 1.8 1.8 2.2 3 .1 1.1-1.9 1.2-2.8 3.6-3.3 1.3-.3 4.8-1.4 5.9-.5 1.5 1.1.6 2.8.4 4.3-.2 1.1-.6 4 1.8 3.4 1.7-.4-.3-4.1.6-5.6 1.3-2.2 5.8-1.4 7 .5 1.3 2.1.5 5.8.1 8.1s-1.2 5-.6 7.4c1.3 5.1 4.4.9 4.3-2.4-.1-4.4-2-8.8-.5-13 .9-2.4 4.6-6.6 7.7-4.5 2.7 1.8.5 7.8.2 10.3-.2 1.7-.8 4.6.2 6.2.9 1.4 2 1.5 2.6-.3.5-1.5-.9-4.5-1-6.1-.2-1.7-.4-3.7.2-5.4 1.8-5.6 3.5 2.4 6.3.6 1.4-.9 4.3-9.4 6.1-3.1.6 2.2-1.3 7.8.7 8.9 4.2 2.3 1.5-7.1 2.2-8 3.1-4 4.7 3.8 6.1 4.1 3.1.7 2.8-7.9 8.1-4.5 1.7 1.1 2.9 3.3 3.2 5.2.4 2.2-1 4.5-.6 6.6 1 4.3 4.4 1.5 4.4-1.7 0-2.7-3-8.3 1.4-9.1 4.4-.9 7.3 3.5 7.8 6.9.3 2-1.5 10.9 1.3 11.3 4.1.6-3.2-15.7 4.8-15.8 4.7-.1 2.8 4.1 3.9 6.6 1 2.4 2.1 1 2.3-.8.3-1.9-.9-3.2 1.3-4.3 5.9-2.9 5.9 5.4 5.5 8.5-.3 2-1.7 8.4 2 8.1 6.9-.5-2.8-16.9 4.8-18.7 4.7-1.2 6.1 3.6 6.3 7.1.1 1.7-1.2 8.1.6 9.1 3.5 2 1.9-7 2-8.4.2-4 1.2-9.6 6.4-9.8 4.7-.2 3.2 4.6 2.7 7.5-.4 2.2 1.3 8.6 3.8 4.4 1.1-1.9-.3-4.1-.3-6 0-1.7.4-3.2 1.3-4.6 1-1.6 2.9-3.5 5.1-2.9 2.5.6 2.3 4.1 4.1 4.9 1.9.8 1.6-.9 2.3-2.1 1.2-2.1 2.1-2.1 4.4-2.4 1.4-.2 3.6-1.5 4.9-.5 2.3 1.7-.7 4.4.1 6.5.6 1.5 2.1 1.7 2.8.3.7-1.4-1.1-3.4-.3-4.8 1.4-2.5 6.2-1.2 7.2 1 2.3 4.8-3.3 12-.2 16.3 3 4.1 3.9-2.8 3.8-4.8-.4-4.3-2.1-8.9 0-13.1 1.3-2.5 5.9-5.7 7.9-2.4 2 3.2-1.3 9.8-.8 13.4.5 4.4 3.5 3.3 2.7-.8-.4-1.9-2.4-10 .6-11.1 3.7-1.4 2.8 7.2 6.5.4 2.2-4.1 4.9-3.1 5.2 1.2.1 1.5-.6 3.1-.4 4.6.2 1.9 1.8 3.7 3.3 1.3 1-1.6-2.6-10.4 2.9-7.3 2.6 1.5 1.6 6.5 4.8 2.7 1.3-1.5 1.7-3.6 4-3.7 2.2-.1 4 2.3 4.8 4.1 1.3 2.9-1.5 8.4.9 10.3 4.2 3.3 3-5.5 2.7-6.9-.6-3.9 1-7.2 5.5-5 4.1 2.1 4.3 7.7 4.1 11.6 0 .8-.6 9.5 2.5 5.2 1.2-1.7-.1-7.7.1-9.6.3-2.9 1.2-5.5 4.3-6.2 4.5-1 7.7 1.5 7.4 5.8-.2 3.5-1.8 7.7-.5 11.1 1 2.7 3.6 2.8 5 .2 1.6-3.1 0-8.3-.4-11.6-.4-4.2-.2-7 1.8-10.8 0 0-.1.1-.1.2-.2.4-.3.7-.4.8v.1c-.1.2-.1.2 0 0v-.1l.4-.8c0-.1.1-.1.1-.2.2-.4.5-.8.8-1.2V0H0z" />
          </svg>
        )
      case 'tilt':
      case 'opacity-tilt':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            className="relative block w-full h-full"
            style={{ fill: color }}
          >
            <path d="M0,6V0h1000v100L0,6z" />
          </svg>
        )
      case 'waves':
      case 'waves-negative':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            className="relative block w-full h-full"
            style={{ fill: color }}
          >
            <path d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7 c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4 c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z" />
          </svg>
        )
      case 'mountains':
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            className="relative block w-full h-full"
            style={{ fill: color }}
          >
            <path
              opacity="0.33"
              d="M473,67.3c-203.9,88.3-263.1-34-320.3,0C66,119.1,0,59.7,0,59.7V0h1000v59.7 c0,0-62.1,26.1-94.9,29.3c-32.8,3.3-62.8-12.3-75.8-22.1C806,49.6,745.3,8.7,694.9,4.7S492.4,59,473,67.3z"
            />
            <path
              opacity="0.66"
              d="M734,67.3c-45.5,0-77.2-23.2-129.1-39.1c-28.6-8.7-150.3-10.1-254,39.1 s-91.7-34.4-149.2,0C115.7,118.3,0,39.8,0,39.8V0h1000v36.5c0,0-28.2-18.5-92.1-18.5C810.2,18.1,775.7,67.3,734,67.3z"
            />
            <path
              d="M766.1,28.9c-200-57.5-266,65.5-395.1,19.5C242,1.8,242,5.4,184.8,20.6C128,35.8,132.3,44.9,89.9,52.5C28.6,63.7,0,0,0,0 h1000c0,0-9.9,40.9-83.6,48.1S829.6,47,766.1,28.9z"
            />
          </svg>
        )
    }
  }

  return (
    <div
      className={`absolute left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none ${
        isBottom ? '-bottom-[1px] rotate-180' : '-top-[1px]'
      }`}
      style={{ height: `${height}px` }}
    >
      {renderShapeSvg()}
    </div>
  )
}

const ResponsiveNavMenu: React.FC<{
  menuItems: any[]
  showDivider?: boolean
  styles?: React.CSSProperties
}> = ({ menuItems, showDivider = false, styles }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [openDropdownId, setOpenDropdownId] = React.useState<number | string | null>(null)

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url?: string) => {
    if (url && url.includes('post=')) {
      e.preventDefault()
      const params = new URLSearchParams(url.split('?')[1] || '')
      const postSlug = params.get('post')
      if (postSlug) {
        window.dispatchEvent(new CustomEvent('openappengine:open-post', { detail: { slug: postSlug } }))
      }
      setIsOpen(false)
      setOpenDropdownId(null)
    }
  }

  return (
    <div className="relative w-full sm:w-auto" style={styles}>
      {/* Mobile Toggle Button */}
      <div className="flex sm:hidden justify-center my-1 w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-500 font-medium text-xs flex items-center gap-1.5 shadow-sm transition bg-white"
        >
          <span>{isOpen ? '✕' : '☰'}</span>
          <span>Menü</span>
        </button>
      </div>

      {/* Desktop Menu */}
      <nav className="hidden sm:flex flex-nowrap items-center gap-1.5 lg:gap-2.5 whitespace-nowrap">
        {menuItems.map((item: any, idx: number) => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0
          return (
            <React.Fragment key={item.id || idx}>
              {showDivider && idx > 0 && (
                <span className="text-gray-300 select-none text-xs px-0.5">|</span>
              )}
              {hasChildren ? (
                <div
                  className="relative group"
                  onMouseEnter={() => setOpenDropdownId(item.id)}
                  onMouseLeave={() => setOpenDropdownId(null)}
                >
                  <button
                    type="button"
                    onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                    className="text-xs sm:text-[13px] font-semibold text-[#333333] hover:text-[#0077B6] transition-colors duration-200 py-1.5 px-1.5 inline-flex items-center gap-1"
                  >
                    <span>{item.title}</span>
                    <span className="text-[10px]">▾</span>
                  </button>
                  <div
                    className={`absolute left-0 top-full pt-1 w-52 z-50 transition-all ${
                      openDropdownId === item.id
                        ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                        : 'opacity-0 invisible -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto'
                    }`}
                  >
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2 flex flex-col min-w-[200px]">
                      {item.children.map((child: any) => (
                        <a
                          key={child.id}
                          href={child.url || '#'}
                          target={child.target || '_self'}
                          onClick={(e) => handleLinkClick(e, child.url)}
                          className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#0077B6] transition text-left"
                        >
                          {child.title}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  href={item.url}
                  target={item.target || '_self'}
                  onClick={(e) => handleLinkClick(e, item.url)}
                  className="text-xs sm:text-[13px] font-semibold text-[#333333] hover:text-[#0077B6] transition-colors duration-200 py-1.5 px-1.5"
                >
                  {item.title}
                </a>
              )}
            </React.Fragment>
          )
        })}
      </nav>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="sm:hidden flex flex-col bg-white border border-gray-100 rounded-xl shadow-xl p-3 mt-2 gap-1.5 w-full z-40 text-center">
          {menuItems.map((item: any) => (
            <React.Fragment key={item.id}>
              <a
                href={item.url}
                onClick={(e) => {
                  handleLinkClick(e, item.url)
                  setIsOpen(false)
                }}
                target={item.target || '_self'}
                className="text-xs font-semibold text-gray-700 hover:text-[#0077B6] hover:bg-gray-50 rounded-lg py-2 transition"
              >
                {item.title}
              </a>
              {Array.isArray(item.children) &&
                item.children.map((child: any) => (
                  <a
                    key={child.id}
                    href={child.url}
                    onClick={(e) => {
                      handleLinkClick(e, child.url)
                      setIsOpen(false)
                    }}
                    className="text-[11px] font-medium text-gray-500 hover:text-[#0077B6] py-1.5 pl-4"
                  >
                    ↳ {child.title}
                  </a>
                ))}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

const NodeItem: React.FC<{
  node: ComponentNode
  siteSlug: string
  site?: Site | null
  menus?: Menu[]
  isEditing?: boolean
  selectedNodeId?: string | null
  onSelectNode?: (node: ComponentNode) => void
  onUpdateNode?: (updatedNode: ComponentNode) => void
  onDuplicateNode?: (nodeId: string) => void
  onDeleteNode?: (nodeId: string) => void
}> = ({
  node,
  siteSlug,
  site = null,
  menus = [],
  isEditing = false,
  selectedNodeId = null,
  onSelectNode,
  onUpdateNode,
  onDuplicateNode,
  onDeleteNode,
}) => {
  const { type, props = {}, styles = {}, children = [] } = node
  const isSelected = isEditing && selectedNodeId === node.id

  const handleSelect = (e: React.MouseEvent) => {
    if (isEditing && onSelectNode) {
      e.stopPropagation()
      onSelectNode(node)
    }
  }

  const renderContent = () => {
    switch (type) {
      case 'Section': {
        const bgStyle: React.CSSProperties = {}
        const bgImageUrl = normalizeMediaUrl(props.bgImage, siteSlug)
        if (bgImageUrl) {
          bgStyle.backgroundImage = `url('${bgImageUrl}')`
          bgStyle.backgroundSize = 'cover'
          bgStyle.backgroundPosition = 'center center'
        }
        if (props.bgColor || styles.backgroundColor) {
          bgStyle.backgroundColor = styles.backgroundColor || props.bgColor
        }
        if (props.minHeight) {
          bgStyle.minHeight = typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight
        }
        if (props.bgAttachment === 'fixed') {
          bgStyle.backgroundAttachment = 'fixed'
        }

        if (styles.borderWidth) bgStyle.borderWidth = styles.borderWidth
        if (styles.borderColor) bgStyle.borderColor = styles.borderColor
        if (styles.borderStyle) bgStyle.borderStyle = styles.borderStyle
        if (styles.padding) bgStyle.padding = styles.padding
        if (styles.margin) bgStyle.margin = styles.margin

        const isRow = props.flexDirection === 'row' || styles.flexDirection === 'row'
        const isHeader = children.some(
          (c) =>
            c.type === 'SiteLogo' ||
            c.type === 'NavMenu' ||
            (c.type === 'Column' &&
              c.children?.some((sc) => sc.type === 'SiteLogo' || sc.type === 'NavMenu'))
        )
        const isSpacerOnly =
          children.length === 1 &&
          (children[0].type === 'Spacer' || children[0].children?.[0]?.type === 'Spacer')

        const paddingClass = isSpacerOnly
          ? 'py-0'
          : isHeader
          ? 'py-2 sm:py-3'
          : styles.padding
          ? ''
          : 'py-10 md:py-14'

        const hasLeftAlignedHeading = children.some(
          (c) => c.type === 'Heading' && (c.props?.align === 'left' || c.styles?.textAlign === 'left')
        )

        const isFooter = node.id === 'd94ff7a' || props.bgColor === '#023E8A' || styles.backgroundColor === '#023E8A'
        const hasMultipleColumns = children.filter((c) => c.type === 'Column').length > 1

        const childWrapperClass = isFooter
          ? 'flex flex-col md:flex-row items-stretch md:items-start justify-center gap-8 md:gap-0 max-w-5xl mx-auto w-full text-white'
          : hasMultipleColumns
          ? 'flex flex-col md:flex-row flex-wrap items-stretch justify-center gap-6 w-full max-w-full'
          : isRow
          ? 'flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 w-full max-w-full'
          : hasLeftAlignedHeading
          ? 'flex flex-col items-stretch justify-center gap-4 w-full max-w-full'
          : 'flex flex-col items-center justify-center gap-4 w-full max-w-full text-center'

        return (
          <section
            id={node.id}
            style={bgStyle}
            className={`relative ${paddingClass} transition-all ${
              isHeader ? 'overflow-visible z-40' : 'overflow-hidden'
            } flex flex-col justify-center`}
          >
            {/* Top Shape Divider */}
            {props.shapeDividerTop && (
              <ShapeDivider
                shape={props.shapeDividerTop.shape}
                position="top"
                color={props.shapeDividerTop.color}
                height={props.shapeDividerTop.height}
              />
            )}

            {/* Video Background */}
            {props.bgVideo && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <iframe
                  src={getYoutubeEmbedUrl(props.bgVideo)}
                  className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80"
                  allow="autoplay; encrypted-media"
                  frameBorder="0"
                />
              </div>
            )}

            {/* Background Overlay */}
            {(props.bgOverlayColor || bgImageUrl) && (
              <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  backgroundColor: props.bgOverlayColor || (bgImageUrl ? '#000000' : 'transparent'),
                  opacity: props.bgOverlayOpacity ?? (bgImageUrl ? 0.35 : 0.68),
                }}
              />
            )}

            {/* Container Content */}
            <div className={`relative ${isHeader ? 'overflow-visible z-40' : 'z-10'} mx-auto px-4 sm:px-6 lg:px-8 w-full ${isHeader ? 'max-w-7xl' : 'max-w-6xl'}`}>
              <div className={childWrapperClass}>
                <ComponentRenderer
                  nodes={children}
                  siteSlug={siteSlug}
                  site={site}
                  menus={menus}
                  isEditing={isEditing}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  onUpdateNode={onUpdateNode}
                  onDuplicateNode={onDuplicateNode}
                  onDeleteNode={onDeleteNode}
                />
              </div>

              {isFooter && (
                <div className="w-full text-center text-xs text-white/50 pt-8 mt-6 border-t border-white/10">
                  © {new Date().getFullYear()} Otizm ve Müzik Yaz Okulu - Tüm Hakları Saklıdır.
                </div>
              )}
            </div>

            {/* Bottom Shape Divider */}
            {props.shapeDividerBottom && (
              <ShapeDivider
                shape={props.shapeDividerBottom.shape}
                position="bottom"
                color={props.shapeDividerBottom.color}
                height={props.shapeDividerBottom.height}
              />
            )}
          </section>
        )
      }

      case 'Column': {
        const isHeaderCol = children.some((c) => c.type === 'NavMenu' || c.type === 'SiteLogo')
        const isFooterCol =
          !isHeaderCol &&
          (node.id === 'e69091a' ||
            node.id === '161f785' ||
            node.id === '42904ea' ||
            (children.some((c) => c.type === 'IconList') &&
              (styles.borderColor || props.align === 'center')))

        if (isFooterCol) {
          return (
            <div className="w-full flex flex-col items-center text-center space-y-3 py-1">
              <ComponentRenderer
                nodes={children}
                siteSlug={siteSlug}
                site={site}
                menus={menus}
                isEditing={isEditing}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
                onUpdateNode={onUpdateNode}
                onDuplicateNode={onDuplicateNode}
                onDeleteNode={onDeleteNode}
              />
            </div>
          )
        }

        const isHeroColumn =
          styles.animation === 'zoomIn' ||
          styles.backgroundColor === '#FFB92C1C' ||
          styles.backgroundColor === '#1A1A1A70' ||
          node.id === '3c904e7'

        const widthVal = typeof props.width === 'number' ? props.width : parseFloat(props.width || '100')
        const widthClass = isHeroColumn
          ? 'w-full flex justify-center items-center'
          : widthVal <= 26
          ? 'w-full md:w-1/4'
          : widthVal <= 34
          ? 'w-full md:w-1/3'
          : widthVal <= 52
          ? 'w-full md:w-1/2'
          : widthVal <= 68
          ? 'w-full md:w-2/3'
          : widthVal <= 76
          ? 'w-full md:w-3/4'
          : 'w-full'

        const animationClass = styles.animation === 'zoomIn' ? 'animate-zoom-in' : ''

        const boxStyle: React.CSSProperties = {}
        if (styles.backgroundColor) boxStyle.backgroundColor = styles.backgroundColor
        if (styles.boxShadow) boxStyle.boxShadow = styles.boxShadow
        if (styles.borderWidth) boxStyle.borderWidth = styles.borderWidth
        if (styles.borderColor) boxStyle.borderColor = styles.borderColor
        if (styles.borderRadius) boxStyle.borderRadius = styles.borderRadius
        if (styles.width && !styles.width.includes('%')) boxStyle.width = styles.width
        if (styles.maxWidth) boxStyle.maxWidth = styles.maxWidth
        if (styles.height) boxStyle.height = styles.height
        if (styles.minHeight) boxStyle.minHeight = styles.minHeight
        if (styles.padding) boxStyle.padding = styles.padding
        if (styles.margin) boxStyle.margin = styles.margin

        if (isHeroColumn) {
          const heroBoxStyle: React.CSSProperties = {
            width: '100%',
            maxWidth: styles.maxWidth || '780px',
            minHeight: styles.minHeight || '240px',
            height: styles.height || 'auto',
            padding: styles.padding || '2.5rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            ...boxStyle,
          }

          return (
            <div className="w-full flex justify-center items-center mx-auto my-4">
              <div
                style={heroBoxStyle}
                className="rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 text-center mx-auto transition-all"
              >
                <ComponentRenderer
                  nodes={children}
                  siteSlug={siteSlug}
                  site={site}
                  menus={menus}
                  isEditing={isEditing}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  onUpdateNode={onUpdateNode}
                  onDuplicateNode={onDuplicateNode}
                  onDeleteNode={onDeleteNode}
                />
              </div>
            </div>
          )
        }

        const isRow = props.flexDirection === 'row' || styles.flexDirection === 'row'
        if (isRow) {
          const isImageBoxGrid = children.length > 0 && children.every((c) => c.type === 'ImageBox')
          if (isImageBoxGrid) {
            return (
              <div
                style={boxStyle}
                className={`${widthClass} ${animationClass} grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center justify-center w-full my-6`}
              >
                <ComponentRenderer
                  nodes={children}
                  siteSlug={siteSlug}
                  site={site}
                  menus={menus}
                  isEditing={isEditing}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  onUpdateNode={onUpdateNode}
                  onDuplicateNode={onDuplicateNode}
                  onDeleteNode={onDeleteNode}
                />
              </div>
            )
          }

          const isHeaderRight = children.some((c) => c.type === 'NavMenu')
          return (
            <div
              style={boxStyle}
              className={`${widthClass} ${animationClass} flex flex-col md:flex-row items-center ${
                isHeaderRight ? 'justify-end gap-6' : 'justify-between gap-6'
              } w-full my-2`}
            >
              <ComponentRenderer
                nodes={children}
                siteSlug={siteSlug}
                site={site}
                menus={menus}
                isEditing={isEditing}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
                onUpdateNode={onUpdateNode}
              />
            </div>
          )
        }

        // Check if all children are Column nodes (multi-column card grid, e.g. "KURULUŞ AMAÇLARI" or "BAŞVURU")
        const isAllColumnGrid = children.length > 1 && children.every((c) => c.type === 'Column')
        if (isAllColumnGrid) {
          const gridColsClass =
            children.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-2xl'
              : children.length === 3
              ? 'grid-cols-1 md:grid-cols-3 max-w-5xl'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-6xl'

          return (
            <div
              style={boxStyle}
              className={`w-full mx-auto ${animationClass} grid ${gridColsClass} gap-6 sm:gap-8 items-stretch my-6`}
            >
              <ComponentRenderer
                nodes={children}
                siteSlug={siteSlug}
                site={site}
                menus={menus}
                isEditing={isEditing}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
                onUpdateNode={onUpdateNode}
                onDuplicateNode={onDuplicateNode}
                onDeleteNode={onDeleteNode}
                inGrid={true}
              />
            </div>
          )
        }

        // If card column with dark/card background (like cards in "KURULUŞ AMAÇLARI")
        const hasCardBg = Boolean(
          (styles.backgroundColor && styles.backgroundColor !== 'transparent') ||
          (props.bgColor && props.bgColor !== 'transparent')
        )
        if (hasCardBg) {
          return (
            <div
              style={boxStyle}
              className={`w-full ${animationClass} rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center justify-between gap-4 text-white`}
            >
              <ComponentRenderer
                nodes={children}
                siteSlug={siteSlug}
                site={site}
                menus={menus}
                isEditing={isEditing}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
                onUpdateNode={onUpdateNode}
                onDuplicateNode={onDuplicateNode}
                onDeleteNode={onDeleteNode}
              />
            </div>
          )
        }

        return (
          <div
            style={boxStyle}
            className={`w-full ${animationClass} space-y-6 ${props.align === 'center' ? 'text-center' : ''}`}
          >
            <ComponentRenderer
              nodes={children}
              siteSlug={siteSlug}
              site={site}
              menus={menus}
              isEditing={isEditing}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              onUpdateNode={onUpdateNode}
              onDuplicateNode={onDuplicateNode}
              onDeleteNode={onDeleteNode}
            />
          </div>
        )
      }

      case 'Heading': {
        const level = props.level || 'h2'
        const align = styles.textAlign || props.align || 'left'
        const color = styles.color || props.color ? { color: styles.color || props.color } : {}

        const alignClass =
          align === 'center' ? 'text-center' :
          align === 'right' ? 'text-right' : 'text-left'

        const editableProps = isSelected
          ? {
              contentEditable: true,
              suppressContentEditableWarning: true,
              onBlur: (e: React.FocusEvent<HTMLElement>) => {
                const text = e.currentTarget.innerText
                if (text !== props.text && onUpdateNode) {
                  onUpdateNode({
                    ...node,
                    props: { ...node.props, text },
                  })
                }
              },
              onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  e.currentTarget.blur()
                }
              },
            }
          : {}

        // Hero heading
        if (styles.fontSize === '5.5em' || node.id === 'c568d68' || styles.fontSize === '2em' || node.id === '3f78df5') {
          return (
            <div className="flex justify-center w-full px-2">
              <h2
                {...editableProps}
                style={{ ...color, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                className={`bg-[#54595FAB] px-4 sm:px-8 py-3 sm:py-5 rounded-2xl text-base sm:text-2xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-wider leading-snug shadow-xl backdrop-blur-sm border border-white/20 text-center uppercase my-2 max-w-[320px] sm:max-w-4xl mx-auto break-words ${
                  isSelected ? 'outline-none cursor-text ring-2 ring-purple-400' : ''
                }`}
              >
                {isSelected ? props.text : renderFormattedText(props.text)}
              </h2>
            </div>
          )
        }

        if (level === 'h1') {
          return (
            <h1
              {...editableProps}
              style={{
                ...color,
                ...(styles.fontSize ? { fontSize: styles.fontSize } : {}),
                ...(styles.fontWeight ? { fontWeight: styles.fontWeight } : {}),
                ...(styles.fontFamily ? { fontFamily: styles.fontFamily } : {}),
              }}
              className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight w-full ${
                props.withDivider ? 'border-b border-gray-300 pb-3 mb-2' : ''
              } ${alignClass} ${isSelected ? 'outline-none cursor-text ring-2 ring-purple-400 rounded px-1' : ''}`}
            >
              {isSelected ? props.text : renderFormattedText(props.text)}
            </h1>
          )
        }

        const isFooterHeading =
          node.id === '1b38d7d' ||
          node.id === '67a458b' ||
          node.id === 'a795e33' ||
          props.color === '#F8F9FA' ||
          styles.color === '#F8F9FA'

        if (isFooterHeading) {
          return (
            <h2
              {...editableProps}
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                color: '#F8F9FA',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
              className={`text-lg sm:text-xl font-semibold text-[#F8F9FA] tracking-wide text-center w-full mb-3 ${
                isSelected ? 'outline-none cursor-text ring-2 ring-purple-400 rounded px-1' : ''
              }`}
            >
              {isSelected ? props.text : renderFormattedText(props.text)}
            </h2>
          )
        }

        const isHeroHeading =
          node.id === '26a5a60' ||
          (props.align === 'center' && (styles.fontSize === '2.6rem' || styles.fontSize === '2.8rem' || styles.fontSize === '3.4em'))

        return (
          <h2
            {...editableProps}
            style={{
              ...color,
              ...(styles.fontSize ? { fontSize: styles.fontSize } : {}),
              ...(styles.fontWeight ? { fontWeight: styles.fontWeight } : {}),
              ...(styles.fontFamily ? { fontFamily: styles.fontFamily } : {}),
              ...(isHeroHeading ? { textShadow: '0 2px 10px rgba(0,0,0,0.5)' } : {}),
            }}
            className={`font-extrabold tracking-tight whitespace-pre-line w-full ${
              isHeroHeading
                ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl my-3 leading-snug text-white text-center'
                : color.color
                ? ''
                : 'text-xl sm:text-2xl text-gray-800'
            } ${props.withDivider ? 'border-b border-gray-300 pb-3 mb-2' : ''} ${alignClass} ${
              isSelected ? 'outline-none cursor-text ring-2 ring-purple-400 rounded px-1' : ''
            }`}
          >
            {isSelected ? props.text : renderFormattedText(props.text)}
          </h2>
        )
      }

      case 'RichText': {
        const align = styles.textAlign || props.align || 'left'
        const alignClass =
          align === 'center' ? 'text-center' :
          align === 'right' ? 'text-right' : 'text-left'

        const isFooterAddress =
          node.id === '26b12d1' ||
          ((styles.color === '#E0E0E0' || props.color === '#E0E0E0') &&
            (styles.textAlign === 'center' || props.align === 'center'))

        if (isFooterAddress) {
          return (
            <div
              style={{ color: '#E0E0E0', fontFamily: 'Poppins, sans-serif' }}
              className="text-xs sm:text-[13px] leading-relaxed text-[#E0E0E0] text-center w-full px-2 [&>p]:text-[#E0E0E0] [&>p]:leading-relaxed font-normal"
              dangerouslySetInnerHTML={{ __html: props.html }}
            />
          )
        }

        const customStyle: React.CSSProperties = {}
        if (styles.color || props.color) customStyle.color = styles.color || props.color
        if (styles.fontSize || props.fontSize) customStyle.fontSize = styles.fontSize || props.fontSize
        if (styles.fontWeight || props.fontWeight) customStyle.fontWeight = styles.fontWeight || props.fontWeight
        if (styles.fontFamily) customStyle.fontFamily = styles.fontFamily
        if (styles.margin) customStyle.margin = styles.margin
        if (styles.padding) customStyle.padding = styles.padding

        const isWhiteText = (styles.color || props.color) === '#FFFFFF'
        const isLargeHeroText = styles.fontSize === '3em' || props.fontSize === '3em'

        if (isLargeHeroText) {
          return (
            <div
              style={customStyle}
              className={`text-2xl sm:text-4xl md:text-5xl font-light tracking-widest text-white leading-relaxed uppercase ${alignClass} drop-shadow-md`}
              dangerouslySetInnerHTML={{ __html: props.html }}
            />
          )
        }

        return (
          <div
            {...(isSelected
              ? {
                  contentEditable: true,
                  suppressContentEditableWarning: true,
                  onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
                    const html = e.currentTarget.innerHTML
                    if (html !== props.html && onUpdateNode) {
                      onUpdateNode({
                        ...node,
                        props: { ...node.props, html },
                      })
                    }
                  },
                }
              : {})}
            style={customStyle}
            className={`leading-relaxed space-y-3 ${isWhiteText ? 'text-white' : customStyle.color ? '' : 'text-gray-700'} ${alignClass} ${
              isSelected ? 'outline-none cursor-text ring-2 ring-purple-400/80 rounded p-1.5' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: props.html }}
          />
        )
      }

      case 'Button': {
        const align = styles.textAlign || props.align || 'left'
        const alignClass =
          align === 'center' ? 'justify-center' :
          align === 'right' ? 'justify-end' : 'justify-start'

        const btnStyle: React.CSSProperties = {}
        if (styles.backgroundColor || props.bgColor) btnStyle.backgroundColor = styles.backgroundColor || props.bgColor
        if (styles.color || props.color) btnStyle.color = styles.color || props.color
        if (styles.borderRadius) btnStyle.borderRadius = styles.borderRadius
        if (styles.boxShadow) btnStyle.boxShadow = styles.boxShadow
        if (styles.padding) btnStyle.padding = styles.padding

        const isRedBtn = (styles.backgroundColor || props.bgColor) === '#FD0101' || node.id === 'c1edc74'
        const hasCustomBg = Boolean(btnStyle.backgroundColor)

        return (
          <div className={`flex w-full ${alignClass} my-3`}>
            <a
              href={normalizeMediaUrl(props.url, siteSlug) || '#'}
              target={props.target || '_self'}
              rel="noopener noreferrer"
              onClick={(e) => {
                if (isEditing) e.preventDefault()
              }}
              style={btnStyle}
              className={`inline-flex items-center justify-center text-center gap-2 px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-full font-bold text-xs sm:text-base leading-snug shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 max-w-[320px] sm:max-w-xl mx-auto whitespace-normal break-words ${
                isRedBtn
                  ? 'bg-[#FD0101] hover:bg-red-700 text-white shadow-red-500/30'
                  : hasCustomBg
                  ? ''
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
              }`}
            >
              {props.icon && <i className={props.icon} />}
              <span
                {...(isSelected
                  ? {
                      contentEditable: true,
                      suppressContentEditableWarning: true,
                      onBlur: (e: React.FocusEvent<HTMLElement>) => {
                        const text = e.currentTarget.innerText
                        if (text !== props.text && onUpdateNode) {
                          onUpdateNode({
                            ...node,
                            props: { ...node.props, text },
                          })
                        }
                      },
                      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          e.currentTarget.blur()
                        }
                      },
                    }
                  : {})}
                className={isSelected ? 'outline-none cursor-text ring-1 ring-white/70 rounded px-1' : ''}
              >
                {isSelected ? (props.text || 'Tıklayınız') : (renderFormattedText(props.text) || 'Tıklayınız')}
              </span>
            </a>
          </div>
        )
      }

      case 'Counter': {
        return (
          <div className="w-full my-4">
            <Counter
              endingNumber={props.endingNumber}
              startingNumber={props.startingNumber}
              prefix={props.prefix}
              suffix={props.suffix}
              title={props.title}
            />
          </div>
        )
      }

      case 'ImageCarousel': {
        return (
          <ImageCarousel
            images={props.images}
            slidesToShow={props.slidesToShow}
            autoplay={props.autoplay}
            siteSlug={siteSlug}
          />
        )
      }

      case 'ImageBox': {
        return (
          <ImageBox
            title={props.title}
            description={props.description}
            imageUrl={props.imageUrl}
            url={props.url}
            siteSlug={siteSlug}
            aspectRatio={props.aspectRatio}
            titleTop={props.titleTop}
          />
        )
      }

      case 'IconBox': {
        const iconColor = props.iconColor || '#3B82F6'
        const titleColor = props.titleColor || '#1F2937'
        const descColor = props.descColor || '#6B7280'
        return (
          <div
            className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition flex flex-col items-center gap-2"
            style={styles}
          >
            <div
              className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm"
              style={{ backgroundColor: `${iconColor}18`, color: iconColor }}
            >
              <i className={props.icon || 'fas fa-star'} />
            </div>
            {props.title && (
              <h3 className="text-lg font-bold" style={{ color: titleColor }}>
                {props.title}
              </h3>
            )}
            {props.description && (
              <p
                className="text-sm leading-relaxed"
                style={{ color: descColor }}
                dangerouslySetInnerHTML={{ __html: props.description }}
              />
            )}
            {props.url && (
              <a
                href={props.url}
                className="text-xs font-semibold hover:underline mt-2 inline-flex items-center gap-1"
                style={{ color: iconColor }}
              >
                İncele &rarr;
              </a>
            )}
          </div>
        )
      }

      case 'SiteLogo': {
        let logoUrl = props.logoUrl || site?.settings?.logo_url || site?.theme_config?.logo_url
        if (!logoUrl && siteSlug.includes('otizmkonfederasyonu')) {
          logoUrl = '/storage/sites/otizmkonfederasyonu/media/2024/02/cropped-konfederasyon_logo.png'
        }
        logoUrl = normalizeMediaUrl(logoUrl, siteSlug)
        const rawWidth = String(props.width || '89px')
        const effectiveMaxWidth = rawWidth.includes('%') ? '240px' : rawWidth

        return (
          <div className="flex items-center" style={{ ...styles, width: 'auto' }}>
            <a href={`/?site=${siteSlug}`} className="inline-flex items-center transition-transform hover:scale-105">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={site?.name || siteSlug}
                  className="h-12 sm:h-14 w-auto object-contain"
                  style={{ maxWidth: effectiveMaxWidth, maxHeight: '64px' }}
                />
              ) : (
                <span className="text-2xl font-black tracking-tight text-gray-900">{site?.name || siteSlug}</span>
              )}
            </a>
          </div>
        )
      }

      case 'NavMenu': {
        const menuItems =
          menus && menus.length > 0 && menus[0].items && menus[0].items.length > 0
            ? menus[0].items
            : [
                { id: 1, title: 'Ana Sayfası', url: `/?site=${siteSlug}` },
                { id: 2, title: 'Kurullar', url: '#' },
                { id: 3, title: 'Yönetim Kurulu', url: `/?site=${siteSlug}&page=kurullar` },
                { id: 4, title: 'Danışma Kurulu', url: `/?site=${siteSlug}&page=danisma-kurulu` },
                { id: 5, title: 'Amaçlarımız', url: '#goals' },
                { id: 6, title: 'İletişim', url: '#contact' },
              ]

        return (
          <ResponsiveNavMenu
            menuItems={menuItems}
            showDivider={Boolean(props.showDivider || siteSlug === 'otizmuzikokulu')}
            styles={styles}
          />
        )
      }

      case 'Accordion': {
        return (
          <Accordion
            items={props.items || []}
            allowMultiple={props.allowMultiple || false}
            accentColor={styles.borderColor || props.accentColor || site?.theme_config?.primary_color || '#4F46E5'}
            cardBg={styles.backgroundColor || props.cardBg}
            titleColor={styles.color || props.titleColor}
          />
        )
      }

      case 'Tabs': {
        return (
          <Tabs
            tabs={props.tabs || []}
            siteSlug={siteSlug}
            accentColor={props.accentColor || site?.theme_config?.primary_color || '#4F46E5'}
            tabStyle={props.tabStyle || 'pills'}
            isEditing={isEditing}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
          />
        )
      }

      case 'SlideCarousel': {
        return (
          <SlideCarousel
            slides={children}
            siteSlug={siteSlug}
            slidesToShow={props.slidesToShow}
            isEditing={isEditing}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
          />
        )
      }

      case 'IconList': {
        return (
          <IconList
            items={props.items}
            iconColor={props.iconColor}
            textColor={props.textColor}
          />
        )
      }

      case 'DownloadsList': {
        return (
          <DownloadsList
            category={props.category}
            title={props.title}
            itemsPerPage={props.itemsPerPage}
          />
        )
      }

      case 'OrgChart': {
        return (
          <OrgChart
            title={props.title}
            members={props.members}
          />
        )
      }

      case 'Spacer': {
        return (
          <>
            {props.anchor && <div id={props.anchor} className="relative -top-24 block invisible" />}
            <div style={{ height: props.height || '30px' }} className="w-full" />
          </>
        )
      }

      case 'SocialIcons': {
        const items = props.items || [
          {
            id: 'ig',
            icon: 'fab fa-instagram',
            url: 'https://www.instagram.com/otizm.konfederasyonu',
          },
          {
            id: 'fb',
            icon: 'fab fa-facebook',
            url: 'https://www.facebook.com/profile.php?id=61556177172422',
          },
        ]

        const justifyClass =
          props.align === 'start' || props.align === 'left'
            ? 'justify-start'
            : props.align === 'end' || props.align === 'right'
            ? 'justify-end'
            : 'justify-center'

        return (
          <div className={`flex items-center gap-3 my-2 w-full ${justifyClass}`}>
            {items.map((s: any, idx: number) => {
              const isInstagram = (s.icon || '').includes('instagram') || (s.url || '').includes('instagram')
              const isFacebook = (s.icon || '').includes('facebook') || (s.url || '').includes('facebook')

              const btnColorClass = isFacebook
                ? 'bg-[#1877F2] hover:bg-[#1567d3]'
                : isInstagram
                ? 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90'
                : 'bg-white/20 hover:bg-white/30 text-white'

              return (
                <a
                  key={s.id || idx}
                  href={s.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-11 h-11 rounded-xl ${btnColorClass} text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 active:scale-95`}
                  title={isInstagram ? 'Instagram' : isFacebook ? 'Facebook' : 'Sosyal Medya'}
                >
                  {isInstagram ? (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  ) : isFacebook ? (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.356 5 15.545 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold">#</span>
                  )}
                </a>
              )
            })}
          </div>
        )
      }

      case 'CallToAction': {
        return (
          <div className="w-full my-6 p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-2xl flex flex-col items-center text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{props.title}</h2>
            {props.description && (
              <p className="text-gray-300 max-w-2xl mb-6">{props.description}</p>
            )}
            <a
              href={props.buttonUrl || '#'}
              className="px-8 py-3.5 rounded-xl bg-white text-gray-900 font-bold shadow-lg hover:bg-gray-100 hover:scale-105 transition"
            >
              {props.buttonText || 'Detaylı Bilgi'}
            </a>
          </div>
        )
      }

      case 'Image': {
        const imgStyle: React.CSSProperties = {}
        if (styles.boxShadow) imgStyle.boxShadow = styles.boxShadow
        if (props.maxWidth) imgStyle.maxWidth = props.maxWidth

        const justifyClass =
          props.align === 'right'
            ? 'justify-end'
            : props.align === 'left'
            ? 'justify-start'
            : 'justify-center'

        return (
          <div className={`flex ${justifyClass} my-3 w-full`}>
            <img
              src={normalizeMediaUrl(props.url, siteSlug)}
              alt={props.alt || ''}
              style={imgStyle}
              className="rounded-xl shadow-lg max-w-full h-auto object-cover max-h-[400px]"
              loading="lazy"
            />
          </div>
        )
      }

      case 'Video': {
        let embedUrl = props.url || ''
        if (embedUrl.includes('youtube.com/watch?v=')) {
          const videoId = embedUrl.split('v=')[1]?.split('&')[0]
          embedUrl = `https://www.youtube.com/embed/${videoId}`
        } else if (embedUrl.includes('youtu.be/')) {
          const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0]
          embedUrl = `https://www.youtube.com/embed/${videoId}`
        }

        return (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl my-6 bg-black">
            <iframe
              src={embedUrl}
              title="Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        )
      }

      case 'MenuAnchor': {
        return <div id={props.anchor} className="relative -top-24 block invisible" />
      }

      case 'Timeline': {
        return <Timeline items={props.items} accentColor={props.accentColor} />
      }

      case 'ImageAccordion': {
        return <ImageAccordion items={props.items} height={props.height} siteSlug={siteSlug} />
      }

      case 'ContactForm': {
        return (
          <ContactForm
            siteSlug={siteSlug}
            title={props.title}
            buttonText={props.buttonText}
            fields={props.fields}
            formId={props.formId}
          />
        )
      }

      case 'GenericWidget': {
        return (
          <div className="p-4 my-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500">
            [Widget: {props.widgetType || 'Bileşen'}]
          </div>
        )
      }

      case 'Countdown': {
        return (
          <Countdown
            targetDate={props.targetDate}
            title={props.title}
            completedText={props.completedText}
            accentColor={styles.color || props.accentColor || site?.theme_config?.primary_color}
            boxBg={styles.backgroundColor || props.boxBg}
            textColor={styles.color || props.textColor}
          />
        )
      }

      case 'PostGrid': {
        return (
          <PostGrid
            siteSlug={siteSlug}
            count={props.count ? Number(props.count) : 3}
            columns={props.columns ? Number(props.columns) : 3}
            showImage={props.showImage !== false}
            showDate={props.showDate !== false}
            showExcerpt={props.showExcerpt !== false}
            readMoreText={props.readMoreText || 'Devamını Oku →'}
            accentColor={styles.color || props.accentColor || site?.theme_config?.primary_color || '#4F46E5'}
          />
        )
      }

      case 'TeamMember': {
        return (
          <TeamMember
            name={props.name || 'Ad Soyad'}
            role={props.role}
            bio={props.bio}
            imageUrl={normalizeMediaUrl(props.imageUrl, siteSlug)}
            socials={props.socials || []}
            accentColor={styles.borderColor || props.accentColor || site?.theme_config?.primary_color || '#4F46E5'}
            cardBg={styles.backgroundColor || props.cardBg}
          />
        )
      }

      case 'LogoTicker': {
        const normalizedLogos = (props.logos || []).map((l: any) => ({
          ...l,
          imageUrl: normalizeMediaUrl(l.imageUrl, siteSlug),
        }))
        return (
          <LogoTicker
            logos={normalizedLogos}
            speed={props.speed || 'normal'}
            grayscale={props.grayscale !== false}
            pauseOnHover={props.pauseOnHover !== false}
            direction={props.direction || 'left'}
          />
        )
      }

      case 'PricingTable': {
        return (
          <PricingTable
            title={props.title || 'Bağış Paketi'}
            price={props.price || '500 ₺'}
            period={props.period}
            description={props.description}
            badge={props.badge}
            isFeatured={props.isFeatured || false}
            features={props.features || []}
            buttonText={props.buttonText || 'Hemen Destek Ol'}
            buttonUrl={props.buttonUrl || '#'}
            accentColor={styles.borderColor || props.accentColor || site?.theme_config?.primary_color || '#4F46E5'}
            cardBg={styles.backgroundColor || props.cardBg}
          />
        )
      }

      case 'Testimonial': {
        return (
          <Testimonial
            name={props.name || 'Ad Soyad'}
            role={props.role}
            quote={props.quote || 'Değerli görüş ve deneyimlerinizi buraya yazabilirsiniz.'}
            rating={props.rating ?? 5}
            imageUrl={normalizeMediaUrl(props.imageUrl, siteSlug)}
            accentColor={props.accentColor || (site?.theme_config as any)?.secondary_color || '#F59E0B'}
            cardBg={styles.backgroundColor || props.cardBg}
          />
        )
      }

      case 'ProgressBar': {
        return (
          <ProgressBar
            label={props.label}
            percentage={props.percentage ?? 75}
            valueText={props.valueText}
            barColor={styles.borderColor || props.barColor || site?.theme_config?.primary_color || '#10B981'}
            trackBg={props.trackBg}
            height={props.height || 16}
            showStripes={props.showStripes !== false}
            textColor={styles.color || props.textColor}
          />
        )
      }

      case 'CallToAction': {
        return (
          <CallToAction
            title={props.title || 'Harekete Geçin!'}
            subtitle={props.subtitle}
            description={props.description}
            buttonText={props.buttonText || 'Hemen Başvurun'}
            buttonUrl={props.buttonUrl || '#'}
            secondaryButtonText={props.secondaryButtonText}
            secondaryButtonUrl={props.secondaryButtonUrl}
            accentColor={styles.borderColor || props.accentColor || site?.theme_config?.primary_color || '#FFB92C'}
            bgColor={styles.backgroundColor || props.bgColor || '#0F172A'}
            textColor={styles.color || props.textColor || '#FFFFFF'}
            layout={props.layout || 'centered'}
          />
        )
      }

      case 'AlertBox': {
        return (
          <AlertBox
            type={props.alertType || props.type || 'info'}
            title={props.title}
            message={props.message || props.text || 'Önemli duyuru veya bilgilendirme metni.'}
            dismissible={props.dismissible !== false}
            actionText={props.actionText}
            actionUrl={props.actionUrl}
          />
        )
      }

      case 'FlipBox': {
        return (
          <FlipBox
            frontIcon={props.frontIcon || '🎹'}
            frontTitle={props.frontTitle || 'Atölye Başlığı'}
            frontSubtitle={props.frontSubtitle}
            frontBg={props.frontBg || '#FFFFFF'}
            frontTextColor={props.frontTextColor || '#1F2937'}
            backTitle={props.backTitle}
            backDescription={props.backDescription || 'Atölye detayları ve kazanımları...'}
            buttonText={props.buttonText || 'İncele'}
            buttonUrl={props.buttonUrl || '#'}
            backBg={styles.backgroundColor || props.backBg || '#023E8A'}
            backTextColor={styles.color || props.backTextColor || '#FFFFFF'}
            accentColor={styles.borderColor || props.accentColor || site?.theme_config?.primary_color || '#FFB92C'}
            minHeight={props.minHeight || 320}
          />
        )
      }

      case 'GoogleMap': {
        return (
          <GoogleMap
            address={props.address || 'Çanakkale Onsekiz Mart Üniversitesi MSSF'}
            height={props.height || 380}
            zoom={props.zoom || 14}
            title={props.title}
            borderRadius={props.borderRadius || 24}
          />
        )
      }

      case 'AudioPlayer': {
        return (
          <AudioPlayer
            title={props.title || 'Piyano & Müzik Kaydı'}
            artist={props.artist || 'Beril Zorlu'}
            audioUrl={normalizeMediaUrl(props.audioUrl, siteSlug)}
            coverUrl={normalizeMediaUrl(props.coverUrl, siteSlug)}
            accentColor={styles.borderColor || props.accentColor || site?.theme_config?.primary_color || '#FFB92C'}
            bgColor={styles.backgroundColor || props.bgColor || '#0F172A'}
            textColor={styles.color || props.textColor || '#FFFFFF'}
          />
        )
      }

      case 'BeforeAfter': {
        return (
          <BeforeAfter
            beforeImage={normalizeMediaUrl(props.beforeImage, siteSlug)}
            afterImage={normalizeMediaUrl(props.afterImage, siteSlug)}
            beforeLabel={props.beforeLabel || 'Öncesi'}
            afterLabel={props.afterLabel || 'Sonrası'}
            defaultPosition={props.defaultPosition ?? 50}
            accentColor={styles.borderColor || props.accentColor || site?.theme_config?.primary_color || '#FFB92C'}
            height={props.height || 420}
          />
        )
      }

      case 'VideoModal': {
        return (
          <VideoModal
            videoUrl={props.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
            coverImage={normalizeMediaUrl(props.coverImage, siteSlug)}
            title={props.title}
            subtitle={props.subtitle}
            playButtonText={props.playButtonText || 'Videoyu İzle'}
            accentColor={styles.borderColor || props.accentColor || site?.theme_config?.primary_color || '#FFB92C'}
            height={props.height || 420}
          />
        )
      }

      case 'FilterableGallery': {
        const normItems = (props.items || []).map((itm: any) => ({
          ...itm,
          imageUrl: normalizeMediaUrl(itm.imageUrl, siteSlug),
        }))
        return (
          <FilterableGallery
            items={normItems}
            columns={props.columns || 3}
            accentColor={styles.borderColor || props.accentColor || site?.theme_config?.primary_color || '#4F46E5'}
          />
        )
      }

      case 'FloatingContact': {
        return (
          <FloatingContact
            phone={props.phone}
            whatsapp={props.whatsapp || '905551234567'}
            message={props.message || 'Merhaba, bilgi almak istiyorum.'}
            label={props.label || 'Bize Ulaşın'}
            position={props.position || 'bottom-right'}
            bgColor={styles.backgroundColor || props.bgColor || '#25D366'}
            pulsing={props.pulsing !== false}
          />
        )
      }

      case 'NewsletterBox': {
        return (
          <NewsletterBox
            title={props.title}
            description={props.description}
            placeholder={props.placeholder}
            buttonText={props.buttonText || 'Abone Ol'}
            successMessage={props.successMessage}
            accentColor={styles.borderColor || props.accentColor || site?.theme_config?.primary_color || '#4F46E5'}
            bgColor={styles.backgroundColor || props.bgColor || '#FFFFFF'}
            textColor={styles.color || props.textColor || '#1F2937'}
          />
        )
      }

      case 'SocialIcons': {
        return (
          <SocialIcons
            items={props.items || []}
            styleType={props.styleType || 'colored'}
            size={props.size || 'medium'}
            align={props.align || 'center'}
          />
        )
      }

      case 'AnimatedHeadline': {
        return (
          <AnimatedHeadline
            prefixText={props.prefixText}
            words={props.words || ['Gelişiyoruz', 'Umut Oluyoruz', 'Büyüyoruz']}
            suffixText={props.suffixText}
            accentColor={styles.borderColor || props.accentColor || site?.theme_config?.primary_color || '#4F46E5'}
            align={props.align || 'center'}
          />
        )
      }

      case 'DonutChart': {
        return (
          <DonutChart
            title={props.title}
            subtitle={props.subtitle}
            slices={props.slices || []}
            centerLabel={props.centerLabel || '%100'}
            centerSubtitle={props.centerSubtitle || 'Şeffaflık'}
            size={props.size || 220}
          />
        )
      }

      default:
        return null
    }
  }

  if (isEditing) {
    return (
      <ResizeHandles
        node={node}
        isSelected={isSelected}
        onUpdateNode={onUpdateNode}
        onDuplicateNode={onDuplicateNode}
        onDeleteNode={onDeleteNode}
      >
        <div
          onClick={handleSelect}
          className={`relative group cursor-pointer transition-all ${
            isSelected
              ? 'ring-2 ring-purple-600 ring-offset-2 rounded-lg'
              : 'hover:outline-dashed hover:outline-1 hover:outline-blue-400'
          }`}
        >
          {!isSelected && (
            <span
              className="absolute -top-3 left-2 z-20 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider shadow-sm transition-opacity bg-blue-600 text-white opacity-0 group-hover:opacity-100"
            >
              {type}
            </span>
          )}
          {renderContent()}
        </div>
      </ResizeHandles>
    )
  }

  return renderContent()
}
