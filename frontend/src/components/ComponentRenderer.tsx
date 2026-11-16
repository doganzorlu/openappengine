import React from 'react'
import type { ComponentNode } from '../types'
import { Timeline } from './Timeline'
import { ImageAccordion } from './ImageAccordion'
import { ContactForm } from './ContactForm'

interface RendererProps {
  nodes: ComponentNode[]
  siteSlug: string
}

export const ComponentRenderer: React.FC<RendererProps> = ({ nodes, siteSlug }) => {
  if (!nodes || !Array.isArray(nodes)) return null

  return (
    <>
      {nodes.map((node) => (
        <NodeItem key={node.id} node={node} siteSlug={siteSlug} />
      ))}
    </>
  )
}

const MountainDivider: React.FC<{ position: 'top' | 'bottom'; color: string; height?: number }> = ({
  position,
  color,
  height = 57,
}) => {
  const isTop = position === 'top'

  return (
    <div
      className={`absolute left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none ${
        isTop ? 'top-0 rotate-180' : 'bottom-0'
      }`}
      style={{ height: `${height}px` }}
    >
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
    </div>
  )
}

const NodeItem: React.FC<{ node: ComponentNode; siteSlug: string }> = ({ node, siteSlug }) => {
  const { type, props = {}, children = [] } = node

  switch (type) {
    case 'Section': {
      const bgStyle: React.CSSProperties = {}
      if (props.bgImage) {
        bgStyle.backgroundImage = `url('${props.bgImage}')`
        bgStyle.backgroundSize = 'cover'
        bgStyle.backgroundPosition = 'top center'
      }
      if (props.bgColor) {
        bgStyle.backgroundColor = props.bgColor
      }
      if (props.minHeight) {
        bgStyle.minHeight = `${props.minHeight}px`
      }
      if (props.bgAttachment === 'fixed') {
        bgStyle.backgroundAttachment = 'fixed'
      }

      return (
        <section
          id={node.id}
          style={bgStyle}
          className="relative py-16 md:py-24 transition-all overflow-hidden flex flex-col justify-center"
        >
          {/* Top Shape Divider */}
          {props.shapeDividerTop && (
            <MountainDivider
              position="top"
              color={props.shapeDividerTop.color}
              height={props.shapeDividerTop.height}
            />
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
              <ComponentRenderer nodes={children} siteSlug={siteSlug} />
            </div>
          </div>

          {/* Bottom Shape Divider */}
          {props.shapeDividerBottom && (
            <MountainDivider
              position="bottom"
              color={props.shapeDividerBottom.color}
              height={props.shapeDividerBottom.height}
            />
          )}
        </section>
      )
    }

    case 'Column': {
      const widthClass =
        props.width === 50 ? 'md:w-[48%] flex-1' :
        props.width === 33 ? 'md:w-[31%] flex-1' :
        props.width === 66 ? 'md:w-[64%] flex-1' :
        'w-full'

      const hasCustomBox = props.bgColor || props.boxShadow
      const animationClass = props.animation === 'zoomIn' ? 'animate-zoom-in' : ''

      const boxStyle: React.CSSProperties = {}
      if (props.bgColor) {
        boxStyle.backgroundColor = props.bgColor
      }

      return (
        <div
          style={boxStyle}
          className={`${widthClass} ${animationClass} ${
            hasCustomBox
              ? 'rounded-3xl p-8 md:p-14 shadow-2xl backdrop-blur-md border border-white/20 my-6 transition-transform'
              : 'space-y-6'
          } ${props.align === 'center' ? 'text-center' : ''}`}
        >
          <ComponentRenderer nodes={children} siteSlug={siteSlug} />
        </div>
      )
    }

    case 'Heading': {
      const level = props.level || 'h2'
      const align = props.align || 'left'
      const color = props.color ? { color: props.color } : {}

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
      const alignClass =
        props.align === 'center' ? 'text-center' :
        props.align === 'right' ? 'text-right' : 'text-left'

      const customStyle: React.CSSProperties = {}
      if (props.color) customStyle.color = props.color
      if (props.fontSize) customStyle.fontSize = props.fontSize
      if (props.fontWeight) customStyle.fontWeight = props.fontWeight

      return (
        <div
          style={customStyle}
          className={`leading-relaxed space-y-3 prose max-w-none ${alignClass}`}
          dangerouslySetInnerHTML={{ __html: props.html }}
        />
      )
    }

    case 'Image': {
      return (
        <div className={`flex justify-${props.align || 'center'} my-4`}>
          <img
            src={props.url}
            alt={props.alt || ''}
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
      return <ContactForm siteSlug={siteSlug} title={props.title} />
    }

    default:
      return null
  }
}
