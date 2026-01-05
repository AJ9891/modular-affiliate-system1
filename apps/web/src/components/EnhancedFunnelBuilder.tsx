'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Eye, Code, Save } from 'lucide-react'

interface BlockConfig {
  id: string
  type: 'hero' | 'features' | 'cta' | 'testimonial' | 'pricing' | 'faq' | 'email-capture'
  content: Record<string, any>
  style: Record<string, any>
}

interface FunnelConfig {
  id?: string
  name: string
  niche?: string
  blocks: BlockConfig[]
  theme: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
  }
}

interface EnhancedFunnelBuilderProps {
  initialNiche?: string
  funnelId?: string | null
  onSave?: (funnelId: string, slug: string) => void
}

const nicheData: Record<string, { name: string; emoji: string; color: string }> = {
  health: { name: 'Health & Wellness', emoji: '💪', color: 'blue' },
  finance: { name: 'Finance & Investing', emoji: '💰', color: 'green' },
  technology: { name: 'Technology & Software', emoji: '💻', color: 'purple' },
  dating: { name: 'Dating & Relationships', emoji: '❤️', color: 'pink' },
  education: { name: 'Education & Courses', emoji: '🎓', color: 'indigo' },
  custom: { name: 'Custom Niche', emoji: '✨', color: 'gray' },
  general: { name: 'General', emoji: '🎯', color: 'slate' }
}

const blockTemplates: Record<string, Omit<BlockConfig, 'id'>> = {
  hero: {
    type: 'hero',
    content: {
      headline: 'Your Compelling Headline Here',
      subheadline: 'A powerful subheadline that drives action',
      cta: 'Get Started Now',
      image: 'https://via.placeholder.com/600x400'
    },
    style: {
      bg: 'gradient',
      layout: 'centered'
    }
  },
  features: {
    type: 'features',
    content: {
      headline: 'Amazing Features',
      features: [
        { icon: '⚡', title: 'Fast', description: 'Lightning fast performance' },
        { icon: '🔒', title: 'Secure', description: 'Bank-level security' },
        { icon: '📊', title: 'Analytics', description: 'Detailed insights' }
      ]
    },
    style: {
      layout: 'grid-3'
    }
  },
  cta: {
    type: 'cta',
    content: {
      headline: 'Ready to Get Started?',
      buttonText: 'Start Your Free Trial',
      subtext: 'No credit card required'
    },
    style: {
      bg: 'primary',
      align: 'center'
    }
  },
  testimonial: {
    type: 'testimonial',
    content: {
      quote: 'This product changed my life!',
      author: 'John Doe',
      role: 'CEO, Company',
      image: 'https://via.placeholder.com/100'
    },
    style: {
      layout: 'card'
    }
  },
  pricing: {
    type: 'pricing',
    content: {
      headline: 'Simple, Transparent Pricing',
      plans: [
        {
          name: 'Basic',
          price: '$29',
          period: '/month',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          cta: 'Get Started'
        },
        {
          name: 'Pro',
          price: '$79',
          period: '/month',
          features: ['Everything in Basic', 'Feature 4', 'Feature 5'],
          cta: 'Get Started',
          highlight: true
        }
      ]
    },
    style: {
      layout: 'cards'
    }
  },
  faq: {
    type: 'faq',
    content: {
      headline: 'Frequently Asked Questions',
      questions: [
        { q: 'What is this?', a: 'This is an amazing product.' },
        { q: 'How does it work?', a: 'It works like magic.' }
      ]
    },
    style: {
      layout: 'accordion'
    }
  },
  'email-capture': {
    type: 'email-capture',
    content: {
      headline: 'Get Exclusive Updates',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe',
      privacy: 'We respect your privacy'
    },
    style: {
      layout: 'inline'
    }
  }
}

export default function EnhancedFunnelBuilder(props: EnhancedFunnelBuilderProps) {
  const { initialNiche = 'general', funnelId, onSave } = props
  const [funnel, setFunnel] = useState<FunnelConfig>({
    name: 'New Funnel',
    niche: initialNiche,
    blocks: [],
    theme: {
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      fontFamily: 'Inter'
    }
  })
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'builder' | 'preview' | 'code'>('builder')
  const [draggedBlock, setDraggedBlock] = useState<number | null>(null)

  useEffect(() => {
    if (initialNiche) {
      setFunnel(prev => ({ ...prev, niche: initialNiche }))
    }
  }, [initialNiche])

  const addBlock = (type: keyof typeof blockTemplates) => {
    const template = blockTemplates[type]
    const newBlock: BlockConfig = {
      id: `block-${Date.now()}`,
      type: template.type,
      content: template.content,
      style: template.style
    }
    setFunnel(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }))
  }

  const removeBlock = (id: string) => {
    setFunnel(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== id)
    }))
    if (selectedBlock === id) setSelectedBlock(null)
  }

  const updateBlock = (id: string, updates: Partial<BlockConfig>) => {
    setFunnel(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
    }))
  }

  const handleDragStart = (index: number) => {
    setDraggedBlock(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedBlock === null || draggedBlock === index) return

    const newBlocks = [...funnel.blocks]
    const draggedItem = newBlocks[draggedBlock]
    newBlocks.splice(draggedBlock, 1)
    newBlocks.splice(index, 0, draggedItem)
    
    setFunnel(prev => ({ ...prev, blocks: newBlocks }))
    setDraggedBlock(index)
  }

  const handleDragEnd = () => {
    setDraggedBlock(null)
  }

  const saveFunnel = async () => {
    try {
      // Generate slug from funnel name
      const slug = funnel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled-funnel'
      
      // Remove client-side id fields from blocks before sending to server
      const cleanedBlocks = funnel.blocks.map(({ id, ...block }) => block)
      
      const payload = {
        name: funnel.name,
        slug,
        niche: funnel.niche || initialNiche,
        blocks: cleanedBlocks,
        theme: funnel.theme
      }

      console.log('Saving funnel with payload:', payload)
      
      const response = await fetch('/api/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (!response.ok) {
        console.error('Save failed:', data.error)
        alert(`Failed to save funnel: ${data.error || 'Unknown error'}`)
        return
      }

      if (data.funnelId) {
        alert('Funnel saved successfully!')
        // Call onSave callback with funnel ID and slug
        if (props.onSave) {
          props.onSave(data.funnelId, slug)
        }
      } else {
        console.error('No funnel ID in response:', data)
        alert('Failed to save funnel: No funnel ID returned')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert(`Failed to save funnel: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const renderBlockPreview = (block: BlockConfig) => {
    const isSelected = selectedBlock === block.id
    
    return (
      <div
        key={block.id}
        draggable
        onDragStart={() => handleDragStart(funnel.blocks.indexOf(block))}
        onDragOver={(e) => handleDragOver(e, funnel.blocks.indexOf(block))}
        onDragEnd={handleDragEnd}
        onClick={() => setSelectedBlock(block.id)}
        className={`
          relative p-4 mb-4 border-2 rounded-lg cursor-move transition-all
          ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
        `}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="text-gray-400" size={20} />
            <span className="font-semibold capitalize">{block.type}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeBlock(block.id)
            }}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={18} />
          </button>
        </div>
        
        {/* Block Preview */}
        <div className="p-4 bg-white rounded border">
          {block.type === 'hero' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{block.content.headline}</h2>
              <p className="text-gray-600 mb-4">{block.content.subheadline}</p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded">
                {block.content.cta}
              </button>
            </div>
          )}
          {block.type === 'features' && (
            <div>
              <h3 className="text-xl font-bold mb-4">{block.content.headline}</h3>
              <div className="grid grid-cols-3 gap-4">
                {block.content.features.map((f: any, i: number) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl mb-2">{f.icon}</div>
                    <h4 className="font-semibold">{f.title}</h4>
                    <p className="text-sm text-gray-600">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {block.type === 'email-capture' && (
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">{block.content.headline}</h3>
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder={block.content.placeholder}
                  className="flex-1 px-4 py-2 border rounded"
                  disabled
                />
                <button className="px-6 py-2 bg-blue-600 text-white rounded">
                  {block.content.buttonText}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={funnel.name}
              onChange={(e) => setFunnel(prev => ({ ...prev, name: e.target.value }))}
              className="text-2xl font-bold border-none focus:outline-none"
            />
            {funnel.niche && nicheData[funnel.niche] && (
              <div className={`px-4 py-2 bg-${nicheData[funnel.niche].color}-100 text-${nicheData[funnel.niche].color}-800 rounded-full text-sm font-semibold flex items-center gap-2`}>
                <span>{nicheData[funnel.niche].emoji}</span>
                <span>{nicheData[funnel.niche].name}</span>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex gap-2 border rounded-lg p-1">
              <button
                onClick={() => setViewMode('builder')}
                className={`px-4 py-2 rounded ${viewMode === 'builder' ? 'bg-blue-600 text-white' : ''}`}
              >
                <Code size={18} />
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-4 py-2 rounded ${viewMode === 'preview' ? 'bg-blue-600 text-white' : ''}`}
              >
                <Eye size={18} />
              </button>
            </div>
            <button
              onClick={saveFunnel}
              className="px-6 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <Save size={18} />
              Save Funnel
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Block Library */}
        <div className="w-64 bg-white border-r p-4">
          <h3 className="font-bold mb-4">Add Blocks</h3>
          <div className="space-y-2">
            {Object.keys(blockTemplates).map(type => (
              <button
                key={type}
                onClick={() => addBlock(type as keyof typeof blockTemplates)}
                className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left capitalize flex items-center gap-2"
              >
                <Plus size={16} />
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Theme Settings */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-bold mb-4">Theme</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Primary Color</label>
                <input
                  type="color"
                  value={funnel.theme.primaryColor}
                  onChange={(e) => setFunnel(prev => ({
                    ...prev,
                    theme: { ...prev.theme, primaryColor: e.target.value }
                  }))}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Secondary Color</label>
                <input
                  type="color"
                  value={funnel.theme.secondaryColor}
                  onChange={(e) => setFunnel(prev => ({
                    ...prev,
                    theme: { ...prev.theme, secondaryColor: e.target.value }
                  }))}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 p-8">
          {funnel.blocks.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl mb-2">No blocks yet</p>
              <p>Add blocks from the left sidebar to start building your funnel</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {funnel.blocks.map(block => renderBlockPreview(block))}
            </div>
          )}
        </div>

        {/* Right Sidebar - Block Editor */}
        {selectedBlock && (
          <div className="w-80 bg-white border-l p-4 overflow-y-auto">
            <h3 className="font-bold mb-4">Edit Block</h3>
            {(() => {
              const block = funnel.blocks.find(b => b.id === selectedBlock)
              if (!block) return null

              return (
                <div className="space-y-4">
                  {Object.entries(block.content).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                      {typeof value === 'string' && (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateBlock(block.id, {
                            content: { ...block.content, [key]: e.target.value }
                          })}
                          className="w-full mt-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
