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

const NodeItem: React.FC<{ node: ComponentNode; siteSlug: string }> = ({ node, siteSlug }) => {
  const { type, props = {}, children = [] } = node

  switch (type) {
    case 'Section': {
      const bgStyle: React.CSSProperties = {}
      if (props.bgImage) {
        bgStyle.backgroundImage = `url('${props.bgImage}')`
        bgStyle.backgroundSize = 'cover'
        bgStyle.backgroundPosition = 'center'
      }
      if (props.bgColor) {
        bgStyle.backgroundColor = props.bgColor
      }
      if (props.minHeight) {
        bgStyle.minHeight = `${props.minHeight}px`
      }

      return (
        <section
          id={node.id}
          style={bgStyle}
          className="relative py-12 md:py-16 transition-all"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row flex-wrap items-center gap-8">
              <ComponentRenderer nodes={children} siteSlug={siteSlug} />
            </div>
          </div>
        </section>
      )
    }

    case 'Column': {
      const widthClass =
        props.width === 50 ? 'md:w-[48%] flex-1' :
        props.width === 33 ? 'md:w-[31%] flex-1' :
        props.width === 66 ? 'md:w-[64%] flex-1' :
        'w-full'

      return (
        <div className={`${widthClass} space-y-6`}>
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

      return (
        <div
          className={`text-gray-700 leading-relaxed space-y-3 prose max-w-none ${alignClass}`}
          style={props.color ? { color: props.color } : {}}
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
      let embedUrl = props.url
      if (embedUrl.includes('youtube.com/watch?v=')) {
        const videoId = embedUrl.split('v=')[1]?.split('&')[0]
        embedUrl = `https://www.youtube.com/embed/${videoId}`
      }

      return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl my-6 bg-black">
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
