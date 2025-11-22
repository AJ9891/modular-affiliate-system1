'use client'

import { useState } from 'react'
import { FunnelBlock } from '@modular-affiliate/sdk'

interface FunnelBuilderProps {
  initialBlocks?: FunnelBlock[]
  onSave: (blocks: FunnelBlock[]) => void
}

export function FunnelBuilder({ initialBlocks = [], onSave }: FunnelBuilderProps) {
  const [blocks, setBlocks] = useState<FunnelBlock[]>(initialBlocks)
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null)

  const blockTypes = [
    { type: 'hero', label: 'Hero Section' },
    { type: 'benefits', label: 'Benefits Grid' },
    { type: 'testimonials', label: 'Testimonials' },
    { type: 'cta', label: 'Call to Action' },
    { type: 'features', label: 'Features List' },
  ]

  const addBlock = (type: string) => {
    const newBlock: FunnelBlock = {
      type,
      content: getDefaultContent(type),
      style: getDefaultStyle(type),
    }
    setBlocks([...blocks, newBlock])
  }

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index))
    setSelectedBlock(null)
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < blocks.length) {
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]]
      setBlocks(newBlocks)
      setSelectedBlock(newIndex)
    }
  }

  const updateBlock = (index: number, updates: Partial<FunnelBlock>) => {
    const newBlocks = [...blocks]
    newBlocks[index] = { ...newBlocks[index], ...updates }
    setBlocks(newBlocks)
  }

  return (
    <div className="flex h-screen">
      {/* Block Library */}
      <div className="w-64 bg-gray-50 border-r p-4">
        <h2 className="text-lg font-semibold mb-4">Block Library</h2>
        <div className="space-y-2">
          {blockTypes.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => addBlock(type)}
              className="w-full px-4 py-2 text-left bg-white border rounded hover:bg-gray-100"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-8 bg-gray-100">
        <div className="max-w-4xl mx-auto bg-white shadow-lg">
          {blocks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>Drag blocks from the library to start building your funnel</p>
            </div>
          ) : (
            blocks.map((block, index) => (
              <div
                key={index}
                onClick={() => setSelectedBlock(index)}
                className={`border-2 p-4 cursor-pointer ${
                  selectedBlock === index ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{block.type}</span>
                  <div className="space-x-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up') }}
                      disabled={index === 0}
                      className="px-2 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down') }}
                      disabled={index === blocks.length - 1}
                      className="px-2 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeBlock(index) }}
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <BlockPreview block={block} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-gray-50 border-l p-4">
        <h2 className="text-lg font-semibold mb-4">Properties</h2>
        {selectedBlock !== null ? (
          <BlockEditor
            block={blocks[selectedBlock]}
            onChange={(updates) => updateBlock(selectedBlock, updates)}
          />
        ) : (
          <p className="text-gray-500 text-sm">Select a block to edit its properties</p>
        )}
        
        <div className="mt-8 pt-4 border-t">
          <button
            onClick={() => onSave(blocks)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Funnel
          </button>
        </div>
      </div>
    </div>
  )
}

function BlockPreview({ block }: { block: FunnelBlock }) {
  return (
    <div className="p-4 bg-gray-50 rounded">
      <pre className="text-xs overflow-auto">
        {JSON.stringify(block.content, null, 2)}
      </pre>
    </div>
  )
}

function BlockEditor({ block, onChange }: { 
  block: FunnelBlock
  onChange: (updates: Partial<FunnelBlock>) => void 
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Block Type</label>
        <input
          type="text"
          value={block.type}
          disabled
          className="w-full px-3 py-2 border rounded bg-gray-100"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Content (JSON)</label>
        <textarea
          value={JSON.stringify(block.content, null, 2)}
          onChange={(e) => {
            try {
              const content = JSON.parse(e.target.value)
              onChange({ content })
            } catch (error) {
              // Invalid JSON, don't update
            }
          }}
          rows={10}
          className="w-full px-3 py-2 border rounded font-mono text-xs"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Style (JSON)</label>
        <textarea
          value={JSON.stringify(block.style, null, 2)}
          onChange={(e) => {
            try {
              const style = JSON.parse(e.target.value)
              onChange({ style })
            } catch (error) {
              // Invalid JSON, don't update
            }
          }}
          rows={6}
          className="w-full px-3 py-2 border rounded font-mono text-xs"
        />
      </div>
    </div>
  )
}

function getDefaultContent(type: string): Record<string, any> {
  const defaults: Record<string, any> = {
    hero: {
      headline: 'Your Headline Here',
      subheadline: 'Your subheadline text',
      cta: 'Get Started',
    },
    benefits: {
      title: 'Key Benefits',
      items: [],
    },
    testimonials: {
      title: 'What Our Customers Say',
      items: [],
    },
    cta: {
      headline: 'Ready to get started?',
      buttonText: 'Click Here',
      buttonLink: '#',
    },
    features: {
      title: 'Features',
      items: [],
    },
  }
  return defaults[type] || {}
}

function getDefaultStyle(type: string): Record<string, any> {
  return {
    bg: 'white',
    layout: 'centered',
    padding: 'large',
  }
}
