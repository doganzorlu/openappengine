import React, { useState } from 'react'
import type { ComponentNode } from '../types'
import { ComponentRenderer } from './ComponentRenderer'

interface TabItem {
  id: string
  title: string
  content?: string
  child?: ComponentNode
}

interface TabsProps {
  tabs: TabItem[]
  siteSlug: string
  isEditing?: boolean
  selectedNodeId?: string | null
  onSelectNode?: (node: ComponentNode) => void
}

export const Tabs: React.FC<TabsProps> = ({
  tabs = [],
  siteSlug,
  isEditing,
  selectedNodeId,
  onSelectNode,
}) => {
  const [activeTab, setActiveTab] = useState(0)

  if (!tabs || tabs.length === 0) return null

  return (
    <div className="w-full my-8">
      {/* Tab Nav Headers */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        {tabs.map((tab, idx) => (
          <button
            key={tab.id || idx}
            onClick={() => setActiveTab(idx)}
            className={`px-6 py-3 font-semibold text-sm sm:text-base border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === idx
                ? 'border-purple-600 text-purple-600 bg-purple-50/50 rounded-t-xl font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-t-xl'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Tab Content Panel */}
      <div className="p-6 bg-white rounded-b-2xl border-x border-b border-gray-200/80 shadow-sm min-h-[160px]">
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
            className="prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: tabs[activeTab].content! }}
          />
        ) : (
          <div className="text-gray-400 text-sm italic">Bu sekmede henüz içerik bulunmuyor.</div>
        )}
      </div>
    </div>
  )
}
