import React from 'react'
import type { ComponentNode } from '../types'
import { Timeline } from './Timeline'
import { ImageAccordion } from './ImageAccordion'
import { ContactForm } from './ContactForm'
import { Counter } from './Counter'
import { ImageCarousel } from './ImageCarousel'
import { Accordion } from './Accordion'
import { ImageBox } from './ImageBox'
import { IconList } from './IconList'
import { DownloadsList } from './DownloadsList'
import { Tabs } from './Tabs'
import { SlideCarousel } from './SlideCarousel'
import { OrgChart } from './OrgChart'

interface RendererProps {
  nodes: ComponentNode[]
  siteSlug: string
  isEditing?: boolean
  selectedNodeId?: string | null
  onSelectNode?: (node: ComponentNode) => void
  isTopLevel?: boolean
  onMoveNode?: (nodeId: string, direction: 'up' | 'down') => void
  onDuplicateNode?: (nodeId: string) => void
  onDeleteNode?: (nodeId: string) => void
  onAddBlockAtIndex?: (index: number) => void
}

export const ComponentRenderer: React.FC<RendererProps> = ({
  nodes,
  siteSlug,
  isEditing = false,
  selectedNodeId = null,
  onSelectNode,
  isTopLevel = false,
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

          <div className="relative group/section">
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
              isEditing={isEditing}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
            />
          </div>
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
        isBottom ? '-bottom-[1px]' : '-top-[1px] rotate-180'
      }`}
      style={{ height: `${height}px` }}
    >
      {renderShapeSvg()}
    </div>
  )
}

const NodeItem: React.FC<{
  node: ComponentNode
  siteSlug: string
  isEditing?: boolean
  selectedNodeId?: string | null
  onSelectNode?: (node: ComponentNode) => void
}> = ({ node, siteSlug, isEditing = false, selectedNodeId = null, onSelectNode }) => {
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
        if (props.bgImage) {
          bgStyle.backgroundImage = `url('${props.bgImage}')`
          bgStyle.backgroundSize = 'cover'
          bgStyle.backgroundPosition = 'top center'
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

        return (
          <section
            id={node.id}
            style={bgStyle}
            className="relative py-16 md:py-24 transition-all overflow-hidden flex flex-col justify-center"
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
            {props.bgOverlayColor && (
              <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  backgroundColor: props.bgOverlayColor,
                  opacity: props.bgOverlayOpacity ?? 0.68,
                }}
              />
            )}

            {/* Container Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-8">
                <ComponentRenderer
                  nodes={children}
                  siteSlug={siteSlug}
                  isEditing={isEditing}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                />
              </div>
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
        const isHeroColumn = styles.animation === 'zoomIn' || styles.backgroundColor === '#FFB92C1C'

        const widthClass = isHeroColumn
          ? 'w-full flex justify-center items-center'
          : props.width === 50 ? 'md:w-[48%] flex-1'
          : props.width === 33 ? 'md:w-[31%] flex-1'
          : props.width === 66 ? 'md:w-[64%] flex-1'
          : 'w-full'

        const animationClass = styles.animation === 'zoomIn' ? 'animate-zoom-in' : ''

        const boxStyle: React.CSSProperties = {}
        if (styles.backgroundColor) boxStyle.backgroundColor = styles.backgroundColor
        if (styles.boxShadow) boxStyle.boxShadow = styles.boxShadow
        if (styles.borderWidth) boxStyle.borderWidth = styles.borderWidth
        if (styles.borderColor) boxStyle.borderColor = styles.borderColor
        if (styles.borderRadius) boxStyle.borderRadius = styles.borderRadius
        if (styles.width) boxStyle.width = styles.width
        if (styles.maxWidth) boxStyle.maxWidth = styles.maxWidth
        if (styles.height) boxStyle.height = styles.height
        if (styles.minHeight) boxStyle.minHeight = styles.minHeight
        if (styles.padding) boxStyle.padding = styles.padding
        if (styles.margin) boxStyle.margin = styles.margin

        if (isHeroColumn) {
          const heroBoxStyle: React.CSSProperties = {
            width: styles.width || '100%',
            maxWidth: styles.maxWidth || '780px',
            minHeight: styles.minHeight || '240px',
            height: styles.height || 'auto',
            padding: styles.padding || '2.5rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            ...boxStyle,
          }

          return (
            <div className={`${widthClass} ${animationClass}`}>
              <div
                style={heroBoxStyle}
                className="rounded-3xl shadow-2xl backdrop-blur-md border border-amber-300/30 text-center transform hover:scale-[1.01] transition-all"
              >
                <ComponentRenderer
                  nodes={children}
                  siteSlug={siteSlug}
                  isEditing={isEditing}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                />
              </div>
            </div>
          )
        }

        if (props.flexDirection === 'row') {
          return (
            <div
              style={boxStyle}
              className={`${widthClass} ${animationClass} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch justify-center w-full`}
            >
              <ComponentRenderer
                nodes={children}
                siteSlug={siteSlug}
                isEditing={isEditing}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
              />
            </div>
          )
        }

        return (
          <div
            style={boxStyle}
            className={`${widthClass} ${animationClass} space-y-6 ${props.align === 'center' ? 'text-center' : ''}`}
          >
            <ComponentRenderer
              nodes={children}
              siteSlug={siteSlug}
              isEditing={isEditing}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
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

        if (level === 'h1') {
          return (
            <h1
              style={color}
              className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight ${alignClass}`}
            >
              {props.text}
            </h1>
          )
        }

        return (
          <h2
            style={color}
            className={`text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight ${alignClass}`}
          >
            {props.text}
          </h2>
        )
      }

      case 'RichText': {
        const align = styles.textAlign || props.align || 'left'
        const alignClass =
          align === 'center' ? 'text-center' :
          align === 'right' ? 'text-right' : 'text-left'

        const customStyle: React.CSSProperties = {}
        if (styles.color || props.color) customStyle.color = styles.color || props.color
        if (styles.fontSize || props.fontSize) customStyle.fontSize = styles.fontSize || props.fontSize
        if (styles.fontWeight || props.fontWeight) customStyle.fontWeight = styles.fontWeight || props.fontWeight
        if (styles.fontFamily) customStyle.fontFamily = styles.fontFamily
        if (styles.margin) customStyle.margin = styles.margin
        if (styles.padding) customStyle.padding = styles.padding

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
            style={customStyle}
            className={`leading-relaxed space-y-3 prose max-w-none ${alignClass}`}
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

        const hasCustomBg = Boolean(btnStyle.backgroundColor)

        return (
          <div className={`flex w-full ${alignClass} my-3`}>
            <a
              href={props.url || '#'}
              target={props.target || '_self'}
              rel="noopener noreferrer"
              style={btnStyle}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm sm:text-base shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ${
                hasCustomBg ? '' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
              }`}
            >
              {props.icon && <i className={props.icon} />}
              <span>{props.text || 'Tıklayınız'}</span>
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
        const logoUrl = props.logoUrl
        return (
          <div className="flex items-center" style={styles}>
            <a href="/" className="inline-block transition-transform hover:scale-105">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Site Logo"
                  style={{ width: props.width || 'auto', maxHeight: '70px', objectFit: 'contain' }}
                />
              ) : (
                <span className="text-2xl font-black tracking-tight text-gray-900">{siteSlug}</span>
              )}
            </a>
          </div>
        )
      }

      case 'NavMenu': {
        return (
          <nav className="flex items-center gap-6" style={styles}>
            <a href="/" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition">
              Ana Sayfa
            </a>
            <a href="/#hakkimizda" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition">
              Hakkımızda
            </a>
            <a href="/#iletisim" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition">
              İletişim
            </a>
          </nav>
        )
      }

      case 'Accordion': {
        return <Accordion items={props.items} />
      }

      case 'Tabs': {
        return (
          <Tabs
            tabs={props.tabs}
            siteSlug={siteSlug}
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
        return (
          <div className={`flex items-center gap-3 my-4 justify-${props.align || 'center'}`}>
            {(props.items || []).map((s: any, idx: number) => (
              <a
                key={s.id || idx}
                href={s.url || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-purple-600 hover:text-white flex items-center justify-center text-gray-700 transition"
              >
                ●
              </a>
            ))}
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

        return (
          <div className={`flex justify-${props.align || 'center'} my-4`}>
            <img
              src={props.url}
              alt={props.alt || ''}
              style={imgStyle}
              className="rounded-2xl shadow-xl max-w-full h-auto object-cover max-h-[500px]"
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
        return <ImageAccordion items={props.items} height={props.height} />
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

      default:
        return null
    }
  }

  if (isEditing) {
    return (
      <div
        onClick={handleSelect}
        className={`relative group cursor-pointer transition-all ${
          isSelected
            ? 'ring-2 ring-purple-600 ring-offset-2 rounded-lg'
            : 'hover:outline-dashed hover:outline-1 hover:outline-blue-400'
        }`}
      >
        <span
          className={`absolute -top-3 left-2 z-20 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider shadow-sm transition-opacity ${
            isSelected
              ? 'bg-purple-600 text-white opacity-100 font-bold'
              : 'bg-blue-600 text-white opacity-0 group-hover:opacity-100'
          }`}
        >
          {type}
        </span>
        {renderContent()}
      </div>
    )
  }

  return renderContent()
}
