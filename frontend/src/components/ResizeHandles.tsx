import React, { useState, useEffect, useRef } from 'react'
import type { ComponentNode } from '../types'

interface ResizeHandlesProps {
  node: ComponentNode
  isSelected: boolean
  onUpdateNode?: (updatedNode: ComponentNode) => void
  children: React.ReactNode
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  node,
  isSelected,
  onUpdateNode,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [liveDimensions, setLiveDimensions] = useState<{ width?: number | string; height?: number } | null>(null)
  const [tooltip, setTooltip] = useState<string | null>(null)

  // Clean up any stray resize events
  useEffect(() => {
    if (!isSelected) {
      setLiveDimensions(null)
      setIsResizing(false)
      setTooltip(null)
    }
  }, [isSelected])

  // Height drag handler (Bottom handle)
  const handleStartHeightResize = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!containerRef.current) return
    const startY = e.clientY
    const rect = containerRef.current.getBoundingClientRect()
    const startHeight = rect.height

    setIsResizing(true)

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY
      const newHeight = Math.max(40, Math.round(startHeight + deltaY))

      setLiveDimensions((prev) => ({
        ...prev,
        height: newHeight,
      }))
      setTooltip(`↕ Yükseklik: ${newHeight}px`)
    }

    const onMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)

      const deltaY = upEvent.clientY - startY
      const finalHeight = Math.max(40, Math.round(startHeight + deltaY))

      setIsResizing(false)
      setTooltip(null)
      setLiveDimensions(null)

      if (onUpdateNode) {
        if (node.type === 'Section') {
          onUpdateNode({
            ...node,
            props: {
              ...node.props,
              minHeight: finalHeight,
            },
          })
        } else {
          onUpdateNode({
            ...node,
            styles: {
              ...(node.styles || {}),
              minHeight: `${finalHeight}px`,
            },
          })
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  // Width drag handler (Right handle)
  const handleStartWidthResize = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!containerRef.current) return
    const startX = e.clientX
    const rect = containerRef.current.getBoundingClientRect()
    const parentRect = containerRef.current.parentElement?.getBoundingClientRect() || rect
    const startWidth = rect.width

    setIsResizing(true)

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const newWidthPx = Math.max(60, Math.round(startWidth + deltaX))

      if (node.type === 'Column') {
        const percent = Math.min(100, Math.max(10, Math.round((newWidthPx / parentRect.width) * 100)))
        // Snap to common column grid percentages
        let snappedPercent = percent
        if (Math.abs(percent - 25) <= 3) snappedPercent = 25
        else if (Math.abs(percent - 33.3) <= 3) snappedPercent = 33.3
        else if (Math.abs(percent - 50) <= 3) snappedPercent = 50
        else if (Math.abs(percent - 66.6) <= 3) snappedPercent = 66.6
        else if (Math.abs(percent - 75) <= 3) snappedPercent = 75
        else if (percent >= 95) snappedPercent = 100

        setLiveDimensions((prev) => ({
          ...prev,
          width: `${snappedPercent}%`,
        }))
        setTooltip(`↔ Kolon Genişliği: %${snappedPercent}`)
      } else {
        setLiveDimensions((prev) => ({
          ...prev,
          width: newWidthPx,
        }))
        setTooltip(`↔ Genişlik: ${newWidthPx}px`)
      }
    }

    const onMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)

      const deltaX = upEvent.clientX - startX
      const finalWidthPx = Math.max(60, Math.round(startWidth + deltaX))

      setIsResizing(false)
      setTooltip(null)
      setLiveDimensions(null)

      if (onUpdateNode) {
        if (node.type === 'Column') {
          const percent = Math.min(100, Math.max(10, Math.round((finalWidthPx / parentRect.width) * 100)))
          let snappedPercent = percent
          if (Math.abs(percent - 25) <= 3) snappedPercent = 25
          else if (Math.abs(percent - 33.3) <= 3) snappedPercent = 33.3
          else if (Math.abs(percent - 50) <= 3) snappedPercent = 50
          else if (Math.abs(percent - 66.6) <= 3) snappedPercent = 66.6
          else if (Math.abs(percent - 75) <= 3) snappedPercent = 75
          else if (percent >= 95) snappedPercent = 100

          onUpdateNode({
            ...node,
            props: {
              ...node.props,
              width: snappedPercent,
            },
          })
        } else {
          onUpdateNode({
            ...node,
            styles: {
              ...(node.styles || {}),
              maxWidth: `${finalWidthPx}px`,
            },
          })
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  // Corner 2D drag handler (Bottom-Right handle)
  const handleStartCornerResize = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!containerRef.current) return
    const startX = e.clientX
    const startY = e.clientY
    const rect = containerRef.current.getBoundingClientRect()
    const startWidth = rect.width
    const startHeight = rect.height

    setIsResizing(true)

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      const newWidth = Math.max(60, Math.round(startWidth + deltaX))
      const newHeight = Math.max(40, Math.round(startHeight + deltaY))

      setLiveDimensions({
        width: newWidth,
        height: newHeight,
      })
      setTooltip(`⤡ ${newWidth}px × ${newHeight}px`)
    }

    const onMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)

      const deltaX = upEvent.clientX - startX
      const deltaY = upEvent.clientY - startY
      const finalWidth = Math.max(60, Math.round(startWidth + deltaX))
      const finalHeight = Math.max(40, Math.round(startHeight + deltaY))

      setIsResizing(false)
      setTooltip(null)
      setLiveDimensions(null)

      if (onUpdateNode) {
        if (node.type === 'Section') {
          onUpdateNode({
            ...node,
            props: {
              ...node.props,
              minHeight: finalHeight,
            },
            styles: {
              ...(node.styles || {}),
              maxWidth: `${finalWidth}px`,
            },
          })
        } else {
          onUpdateNode({
            ...node,
            styles: {
              ...(node.styles || {}),
              minHeight: `${finalHeight}px`,
              maxWidth: `${finalWidth}px`,
            },
          })
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const liveStyle: React.CSSProperties = {}
  if (liveDimensions?.height) {
    liveStyle.minHeight = `${liveDimensions.height}px`
  }
  if (liveDimensions?.width) {
    liveStyle.width = typeof liveDimensions.width === 'number' ? `${liveDimensions.width}px` : liveDimensions.width
  }

  return (
    <div
      ref={containerRef}
      style={liveStyle}
      className={`relative ${isSelected ? 'transition-none' : ''} ${isResizing ? 'select-none ring-2 ring-purple-500' : ''}`}
    >
      {children}

      {/* Interactive PowerPoint-style Resize Handles (Shown only when selected) */}
      {isSelected && (
        <>
          {/* Active Tooltip Badge during dragging */}
          {tooltip && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-2xl border border-gray-700 pointer-events-none whitespace-nowrap animate-fade-in flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>{tooltip}</span>
            </div>
          )}

          {/* Bottom Resize Handle Bar (↕ Height) */}
          <div
            onMouseDown={handleStartHeightResize}
            title="Aşağı/Yukarı Çekerek Yüksekliği Ayarlayın"
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-40 cursor-ns-resize group/handle"
          >
            <div className="flex items-center justify-center px-4 py-1 rounded-full bg-purple-600 text-white shadow-xl hover:bg-purple-700 hover:scale-110 active:scale-95 transition-transform border-2 border-white select-none">
              <span className="text-[10px] font-bold tracking-widest leading-none">↕ YÜKSEKLİK</span>
            </div>
          </div>

          {/* Right Resize Handle Bar (↔ Width) */}
          <div
            onMouseDown={handleStartWidthResize}
            title="Sağa/Sola Çekerek Genişliği Ayarlayın"
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-40 cursor-ew-resize group/handle"
          >
            <div className="flex items-center justify-center py-3 px-1 rounded-full bg-purple-600 text-white shadow-xl hover:bg-purple-700 hover:scale-110 active:scale-95 transition-transform border-2 border-white select-none">
              <span className="text-[10px] font-bold leading-none">↔</span>
            </div>
          </div>

          {/* Bottom-Right Corner Handle (⤡ 2D Proportional) */}
          <div
            onMouseDown={handleStartCornerResize}
            title="Köşeden Çekerek PowerPoint Gibi Boyutlandırın"
            className="absolute -bottom-2.5 -right-2.5 z-40 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-2xl hover:scale-125 active:scale-95 transition-transform border-2 border-white cursor-nwse-resize flex items-center justify-center text-[11px] font-bold select-none"
          >
            ⤡
          </div>
        </>
      )}
    </div>
  )
}
