import React, { useState } from 'react'
import type { ComponentNode } from '../types'
import { ComponentRenderer } from './ComponentRenderer'

export interface TabItem {
  id?: string
  title: string
  content?: string
  child?: ComponentNode
}

interface TabsProps {
  tabs: TabItem[]
  siteSlug?: string
  accentColor?: string
  tabStyle?: 'pills' | 'underline'
  isEditing?: boolean
  selectedNodeId?: string | null
  onSelectNode?: (node: ComponentNode) => void
}

export const Tabs: React.FC<TabsProps> = ({
  tabs = [],
  siteSlug = 'berilzorlu',
  accentColor = '#4F46E5',
  tabStyle = 'pills',
  isEditing,
  selectedNodeId,
  onSelectNode,
}) => {
  const [activeTab, setActiveTab] = useState(0)

  if (!tabs || tabs.length === 0) return null

  return (
    <div className="w-full my-6 max-w-4xl mx-auto">
      {/* Tab Nav Headers */}
      <div
        className={`flex items-center gap-2 overflow-x-auto pb-1 mb-4 ${
          tabStyle === 'underline' ? 'border-b border-gray-200' : ''
        }`}
      >
        {tabs.map((tab, idx) => {
          const isActive = activeTab === idx
          if (tabStyle === 'pills') {
            return (
              <button
                key={tab.id || idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                style={{
                  backgroundColor: isActive ? accentColor : '#F1F5F9',
                  color: isActive ? '#FFFFFF' : '#475569',
                }}
                className="px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap shadow-xs hover:opacity-90 transition-all duration-200 cursor-pointer"
              >
                {tab.title}
              </button>
            )
          }

          return (
            <button
              key={tab.id || idx}
              type="button"
              onClick={() => setActiveTab(idx)}
              style={{
                borderColor: isActive ? accentColor : 'transparent',
                color: isActive ? accentColor : '#64748B',
              }}
              className="px-6 py-3 font-bold text-sm sm:text-base border-b-2 whitespace-nowrap transition-all duration-200 cursor-pointer hover:text-gray-900"
            >
              {tab.title}
            </button>
          )
        })}
      </div>

      {/* Tab Content Panel */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm min-h-[160px]">
        {tabs[activeTab]?.child ? (
          <ComponentRenderer
            nodes={[tabs[activeTab].child!]}
            siteSlug={siteSlug}
            isEditing={isEditing}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
          />
        ) : tabs[activeTab]?.content ? (
          <div
            className="prose max-w-none text-gray-700 leading-relaxed text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: tabs[activeTab].content! }}
          />
        ) : (
          <div className="text-gray-400 text-sm italic">Bu sekmede henüz içerik bulunmuyor.</div>
        )}
      </div>
    </div>
  )
}
