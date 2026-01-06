'use client'

import { useState, useCallback } from 'react'
import { BrandModeKey, useBrandMode } from '@/contexts/BrandModeContext'
import { PersonalitySelector } from './PersonalitySelector'
import { designTokens } from '@/config/designTokens'
import { COMPONENT_CONTRACTS } from '@/types/component'

export interface FunnelBlock {
  id: string
  type: 'hero' | 'benefits' | 'testimonials' | 'cta' | 'features' | 'pricing'
  content: Record<string, any>
  style: Record<string, any>
  brandMode?: BrandModeKey
}

interface DragDropBuilderProps {
  initialBlocks?: FunnelBlock[]
  onSave?: (blocks: FunnelBlock[]) => Promise<void>
}

export default function DragDropBuilder({ initialBlocks = [], onSave }: DragDropBuilderProps) {
  const [blocks, setBlocks] = useState<FunnelBlock[]>(initialBlocks)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null)
  const { mode, setMode } = useBrandMode()
  const [saving, setSaving] = useState(false)

  const blockTemplates = [
    { type: 'hero', label: 'Hero Section', icon: '🚀', description: 'Main headline + CTA' },
    { type: 'benefits', label: 'Benefits Grid', icon: '✨', description: '3-column benefits' },
    { type: 'testimonials', label: 'Testimonials', icon: '💬', description: 'Social proof' },
    { type: 'cta', label: 'Call to Action', icon: '🎯', description: 'Conversion focus' },
    { type: 'features', label: 'Features List', icon: '⭐', description: 'Feature breakdown' },
    { type: 'pricing', label: 'Pricing Table', icon: '💰', description: 'Pricing options' },
  ]

  const addBlock = (type: string) => {
    const newBlock: FunnelBlock = {
      id: `block-${Date.now()}`,
      type: type as FunnelBlock['type'],
      content: getDefaultContent(type),
      style: getDefaultStyle(type),
      brandMode: mode,
    }
    setBlocks([...blocks, newBlock])
    setSelectedBlockId(newBlock.id)
  }

  const duplicateBlock = (id: string) => {
    const blockToDuplicate = blocks.find(b => b.id === id)
    if (!blockToDuplicate) return
    
    const newBlock = {
      ...blockToDuplicate,
      id: `block-${Date.now()}`,
    }
    const index = blocks.findIndex(b => b.id === id)
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    setBlocks(newBlocks)
  }

  const removeBlock = (id: string) => {
    const block = blocks.find(b => b.id === id)
    if (block?.type === 'hero') {
      alert('Hero sections cannot be deleted')
      return
    }
    setBlocks(blocks.filter(block => block.id !== id))
    if (selectedBlockId === id) setSelectedBlockId(null)
  }

  const handleDragStart = (id: string) => {
    setDraggedBlock(id)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedBlock || draggedBlock === targetId) return

    const draggedIndex = blocks.findIndex(b => b.id === draggedBlock)
    const targetIndex = blocks.findIndex(b => b.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newBlocks = [...blocks]
    const [removed] = newBlocks.splice(draggedIndex, 1)
    newBlocks.splice(targetIndex, 0, removed)
    setBlocks(newBlocks)
  }

  const handleDragEnd = () => {
    setDraggedBlock(null)
  }

  const updateBlockContent = (id: string, field: string, value: any) => {
    setBlocks(blocks.map(block => 
      block.id === id 
        ? { ...block, content: { ...block.content, [field]: value } }
        : block
    ))
  }

  const updateBlockStyle = (id: string, field: string, value: any) => {
    setBlocks(blocks.map(block => 
      block.id === id 
        ? { ...block, style: { ...block.style, [field]: value } }
        : block
    ))
  }

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(blocks)
    } finally {
      setSaving(false)
    }
  }

  const selectedBlock = blocks.find(b => b.id === selectedBlockId)
  const currentTheme = designTokens.colors[mode]
  const selectedContract = selectedBlock ? COMPONENT_CONTRACTS[selectedBlock.type] : null

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-bold">Visual Funnel Builder</h1>
          <p className="text-sm text-gray-500">Choose your voice. The AI will match it.</p>
        </div>
        <div className="flex gap-3">
          <PersonalitySelector compact={true} />
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Preview
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Funnel'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Block Library */}
        <div className="w-64 bg-white border-r overflow-y-auto p-4">
          <h2 className="font-semibold mb-4 text-gray-700">Add Blocks</h2>
          <div className="space-y-2">
            {blockTemplates.map((template) => (
              <button
                key={template.type}
                onClick={() => addBlock(template.type)}
                className="w-full text-left p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{template.icon}</span>
                  <span className="font-medium text-sm">{template.label}</span>
                </div>
                <p className="text-xs text-gray-500 ml-8">{template.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Current Theme</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded" 
                  style={{ backgroundColor: currentTheme.bg }}
                />
                <span>Background</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded" 
                  style={{ backgroundColor: currentTheme.accent }}
                />
                <span>Accent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto space-y-4">
            {blocks.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Start Building Your Funnel
                </h3>
                <p className="text-gray-500">
                  Drag blocks from the left sidebar to create your funnel
                </p>
              </div>
            ) : (
              blocks.map((block) => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={() => handleDragStart(block.id)}
                  onDragOver={(e) => handleDragOver(e, block.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`bg-white rounded-lg shadow-sm border-2 cursor-move transition-all ${
                    selectedBlockId === block.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${draggedBlock === block.id ? 'opacity-50' : ''}`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {blockTemplates.find(t => t.type === block.type)?.icon}
                        </span>
                        <span className="font-medium capitalize">{block.type}</span>
                        {block.brandMode && (
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {block.brandMode}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateBlock(block.id)
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Duplicate"
                        >
                          📋
                        </button>
                        {COMPONENT_CONTRACTS[block.type].allowDelete ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeBlock(block.id)
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        ) : (
                          <span className="p-1 text-gray-400 text-xs" title="This section is locked to preserve design integrity.">
                            🔒
                          </span>
                        )}
                      </div>
                    </div>
                    <BlockPreview block={block} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-80 bg-white border-l overflow-y-auto p-4">
          {selectedBlock ? (
            <>
              <h2 className="font-semibold mb-4">Block Properties</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <input
                    type="text"
                    value={selectedBlock.type}
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 capitalize"
                  />
                </div>

                {selectedBlock.type === 'hero' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Headline</label>
                      <input
                        type="text"
                        value={selectedBlock.content.headline || ''}
                        onChange={(e) => updateBlockContent(selectedBlock.id, 'headline', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Enter headline"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subheadline</label>
                      <textarea
                        value={selectedBlock.content.subheadline || ''}
                        onChange={(e) => updateBlockContent(selectedBlock.id, 'subheadline', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows={3}
                        placeholder="Enter subheadline"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CTA Text</label>
                      <input
                        type="text"
                        value={selectedBlock.content.ctaText || ''}
                        onChange={(e) => updateBlockContent(selectedBlock.id, 'ctaText', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Button text"
                      />
                    </div>
                  </>
                )}

                {selectedBlock.type === 'cta' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Message</label>
                      <textarea
                        value={selectedBlock.content.message || ''}
                        onChange={(e) => updateBlockContent(selectedBlock.id, 'message', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows={2}
                        placeholder="Call to action message"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Button Text</label>
                      <input
                        type="text"
                        value={selectedBlock.content.buttonText || ''}
                        onChange={(e) => updateBlockContent(selectedBlock.id, 'buttonText', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Button text"
                      />
                    </div>
                  </>
                )}

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-3">Styling</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Background</label>
                      <input
                        type="color"
                        value={selectedBlock.style.backgroundColor || currentTheme.bg}
                        onChange={(e) => updateBlockStyle(selectedBlock.id, 'backgroundColor', e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Text Color</label>
                      <input
                        type="color"
                        value={selectedBlock.style.textColor || currentTheme.text}
                        onChange={(e) => updateBlockStyle(selectedBlock.id, 'textColor', e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    {selectedContract?.allowSpacing && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Padding</label>
                        <select
                          value={selectedBlock.style.padding || 'md'}
                          onChange={(e) => updateBlockStyle(selectedBlock.id, 'padding', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="xs">Extra Small</option>
                          <option value="sm">Small</option>
                          <option value="md">Medium</option>
                          <option value="lg">Large</option>
                          <option value="xl">Extra Large</option>
                        </select>
                      </div>
                    )}
                    {!selectedContract?.allowSpacing && (
                      <div className="text-xs text-gray-500 italic">
                        🔒 This section is locked to preserve design integrity.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <div className="text-4xl mb-2">👈</div>
              <p>Select a block to edit its properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BlockPreview({ block }: { block: FunnelBlock }) {
  const paddingValue = designTokens.spacing[block.style.padding as keyof typeof designTokens.spacing] || designTokens.spacing.md;
  const style: React.CSSProperties = {
    backgroundColor: block.style.backgroundColor || '#fff',
    color: block.style.textColor || '#000',
    padding: typeof paddingValue === 'string' ? paddingValue : `${paddingValue}px`,
  }

  return (
    <div style={style} className="rounded-lg min-h-[100px]">
      {block.type === 'hero' && (
        <div>
          <h3 className="text-2xl font-bold mb-2">
            {block.content.headline || 'Hero Headline'}
          </h3>
          <p className="text-sm opacity-80 mb-4">
            {block.content.subheadline || 'Your compelling subheadline goes here'}
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            {block.content.ctaText || 'Get Started'}
          </button>
        </div>
      )}

      {block.type === 'benefits' && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-sm font-medium">Benefit {i}</p>
            </div>
          ))}
        </div>
      )}

      {block.type === 'testimonials' && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-gray-300" />
              <div className="flex-1">
                <p className="text-sm italic">"Great testimonial here..."</p>
                <p className="text-xs opacity-70 mt-1">— Customer {i}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {block.type === 'cta' && (
        <div className="text-center">
          <p className="text-lg font-medium mb-4">
            {block.content.message || 'Ready to get started?'}
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            {block.content.buttonText || 'Take Action Now'}
          </button>
        </div>
      )}

      {block.type === 'features' && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <span>✓</span>
              <span className="text-sm">Feature {i}</span>
            </div>
          ))}
        </div>
      )}

      {block.type === 'pricing' && (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-4 text-center">
              <h4 className="font-bold mb-2">Plan {i}</h4>
              <p className="text-2xl font-bold mb-2">${i * 49}</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm w-full">
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getDefaultContent(type: string): Record<string, any> {
  switch (type) {
    case 'hero':
      return {
        headline: 'Your Powerful Headline',
        subheadline: 'A compelling subheadline that explains the value proposition',
        ctaText: 'Get Started',
      }
    case 'cta':
      return {
        message: 'Ready to take action?',
        buttonText: 'Get Started Now',
      }
    default:
      return {}
  }
}

function getDefaultStyle(type: string): Record<string, any> {
  return {
    padding: 'lg',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  }
}
