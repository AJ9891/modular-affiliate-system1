'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrandModeProvider, useBrandMode } from '@/contexts/BrandModeContext'
import { PersonalitySelector } from '@/components/PersonalitySelector'

interface FunnelBlock {
  id: string
  type: string
  content: Record<string, any>
  style: Record<string, any>
}

function BuilderContent() {
  const router = useRouter()
  const { mode } = useBrandMode()
  const [funnelName, setFunnelName] = useState('')
  const [blocks, setBlocks] = useState<FunnelBlock[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPersonalityPanel, setShowPersonalityPanel] = useState(false)

  const blockTypes = [
    { type: 'hero', label: 'Hero Section', icon: '🎯' },
    { type: 'benefits', label: 'Benefits Grid', icon: '✨' },
    { type: 'testimonials', label: 'Testimonials', icon: '💬' },
    { type: 'cta', label: 'Call to Action', icon: '🚀' },
    { type: 'features', label: 'Features List', icon: '⭐' },
    { type: 'pricing', label: 'Pricing Table', icon: '💰' },
  ]

  const addBlock = (type: string) => {
    const newBlock: FunnelBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      style: getDefaultStyle(type),
    }
    setBlocks([...blocks, newBlock])
  }

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id))
    if (selectedBlockId === id) setSelectedBlockId(null)
  }

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id)
    if (index === -1) return
    
    const newBlocks = [...blocks]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < blocks.length) {
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]]
      setBlocks(newBlocks)
    }
  }

  const updateBlock = (id: string, updates: Partial<FunnelBlock>) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ))
  }

  const saveFunnel = async () => {
    if (!funnelName.trim()) {
      alert('Please enter a funnel name')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: funnelName,
          slug: funnelName.toLowerCase().replace(/\s+/g, '-'),
          blocks: blocks.map(({ id, ...block }) => block),
        })
      })

      if (!response.ok) throw new Error('Failed to save funnel')

      alert('Funnel saved successfully!')
      router.push('/dashboard')
    } catch (error) {
      alert('Error saving funnel. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const selectedBlock = blocks.find(b => b.id === selectedBlockId)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-full px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Voice:</span>
              <span className="text-lg font-semibold text-blue-600">
                {mode === 'rocket' && '🚀 Rocket'}
                {mode === 'meltdown' && '🤖 Meltdown'}
                {mode === 'antiguru' && '⚡ Anti-Guru'}
              </span>
              <button
                onClick={() => setShowPersonalityPanel(!showPersonalityPanel)}
                className="ml-2 px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
              >
                Change
              </button>
            </div>
            <input
              type="text"
              placeholder="Funnel Name"
              value={funnelName}
              onChange={(e) => setFunnelName(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
            />
            <button
              onClick={saveFunnel}
              disabled={saving || blocks.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Funnel'}
            </button>
          </div>
        </div>

        {/* Personality Selector Panel */}
        {showPersonalityPanel && (
          <div className="bg-gray-50 border-t p-6">
            <PersonalitySelector 
              compact={false} 
              onSelectionComplete={() => setShowPersonalityPanel(false)}
            />
          </div>
        )}
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Block Library Sidebar */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Block Library</h2>
          <div className="space-y-2">
            {blockTypes.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="w-full px-4 py-3 text-left bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-3"
              >
                <span className="text-2xl">{icon}</span>
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-8 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            {blocks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-2xl font-bold mb-2">Start Building Your Funnel</h3>
                <p className="text-gray-600">
                  Add blocks from the left sidebar to create your funnel
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer border-2 transition-all ${
                      selectedBlockId === block.id 
                        ? 'border-blue-600 shadow-lg' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg capitalize">{block.type}</span>
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up') }}
                          disabled={index === 0}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ↑
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down') }}
                          disabled={index === blocks.length - 1}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ↓
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeBlock(block.id) }}
                          className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <BlockPreview block={block} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-96 bg-white border-l p-6 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Block Properties</h2>
          {selectedBlock ? (
            <BlockEditor
              block={selectedBlock}
              onChange={(updates) => updateBlock(selectedBlock.id, updates)}
            />
          ) : (
            <p className="text-gray-500 text-sm">Select a block to edit its properties</p>
          )}
        </div>
      </div>
    </main>
  )
}

function BlockPreview({ block }: { block: FunnelBlock }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      {block.type === 'hero' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{block.content.headline || 'Headline'}</h2>
          <p className="text-gray-600 mb-4">{block.content.subheadline || 'Subheadline'}</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            {block.content.cta || 'Call to Action'}
          </button>
        </div>
      )}
      {block.type === 'benefits' && (
        <div>
          <h3 className="text-xl font-bold mb-3">{block.content.title || 'Benefits'}</h3>
          <div className="space-y-2 text-sm text-gray-600">
            {block.content.items?.length > 0 ? (
              block.content.items.map((item: any, i: number) => (
                <div key={i}>• {item.title}</div>
              ))
            ) : (
              <div className="text-gray-400">No items added yet</div>
            )}
          </div>
        </div>
      )}
      {block.type === 'cta' && (
        <div className="text-center p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
          <h3 className="text-xl font-bold mb-4">{block.content.headline || 'Ready to get started?'}</h3>
          <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg">
            {block.content.buttonText || 'Click Here'}
          </button>
        </div>
      )}
      {!['hero', 'benefits', 'cta'].includes(block.type) && (
        <div className="text-sm text-gray-600">
          <div className="font-semibold mb-2 capitalize">{block.type} Block</div>
          <pre className="text-xs overflow-auto max-h-32">
            {JSON.stringify(block.content, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

function BlockEditor({ block, onChange }: { 
  block: FunnelBlock
  onChange: (updates: Partial<FunnelBlock>) => void 
}) {
  const [contentJson, setContentJson] = useState(JSON.stringify(block.content, null, 2))

  const handleContentChange = (value: string) => {
    setContentJson(value)
    try {
      const parsed = JSON.parse(value)
      onChange({ content: parsed })
    } catch (e) {
      // Invalid JSON, don't update
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">Block Type</label>
        <input
          type="text"
          value={block.type}
          disabled
          className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 capitalize"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold mb-2">Content (JSON)</label>
        <textarea
          value={contentJson}
          onChange={(e) => handleContentChange(e.target.value)}
          rows={15}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-xs focus:border-blue-600 focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">Edit the JSON to update the block content</p>
      </div>
    </div>
  )
}

function getDefaultContent(type: string): Record<string, any> {
  const defaults: Record<string, any> = {
    hero: {
      headline: 'Transform Your Life Today',
      subheadline: 'Join thousands who have already succeeded',
      cta: 'Get Started Now',
    },
    benefits: {
      title: 'Why Choose Us',
      items: [
        { title: 'Proven Results', description: 'Real success stories' },
        { title: 'Expert Support', description: '24/7 assistance' },
        { title: 'Money Back Guarantee', description: 'Risk-free trial' },
      ],
    },
    testimonials: {
      title: 'What Our Customers Say',
      items: [
        { name: 'John D.', text: 'This changed my life!', rating: 5 },
      ],
    },
    cta: {
      headline: 'Ready to get started?',
      buttonText: 'Start Now',
      buttonLink: '#',
    },
    features: {
      title: 'Amazing Features',
      items: [
        { name: 'Feature 1', description: 'Description here' },
      ],
    },
    pricing: {
      title: 'Choose Your Plan',
      plans: [
        { name: 'Basic', price: '$29', features: ['Feature 1', 'Feature 2'] },
      ],
    },
  }
  return defaults[type] || {}
}

function getDefaultStyle(type: string): Record<string, any> {
  return {
    background: 'white',
    padding: 'large',
    textAlign: 'center',
  }
}

export default function Builder() {
  return (
    <BrandModeProvider>
      <BuilderContent />
    </BrandModeProvider>
  )
}
