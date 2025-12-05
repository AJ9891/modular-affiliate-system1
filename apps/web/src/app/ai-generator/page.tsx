'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function AIGeneratorPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('preview')
  const [savedContent, setSavedContent] = useState<Array<{id: string, content: string, type: string, timestamp: number}>>([])
  const [designVariant, setDesignVariant] = useState(0)
  const [contentType, setContentType] = useState<'headline' | 'subheadline' | 'cta' | 'bullet-points' | 'full-page' | 'email'>('headline')
  const [formData, setFormData] = useState({
    niche: '',
    productName: '',
    audience: '',
    tone: 'professional' as 'professional' | 'casual' | 'urgent' | 'friendly',
    context: '',
  })

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setGeneratedContent('')

    try {
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contentType,
          ...formData,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to generate content')
        return
      }

      const data = await res.json()
      setGeneratedContent(data.content)
      // Randomize design variant each time
      setDesignVariant(Math.floor(Math.random() * 5))
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generatedContent)
    alert('Content copied to clipboard!')
  }

  function saveContent() {
    const newSaved = {
      id: Date.now().toString(),
      content: generatedContent,
      type: contentType,
      timestamp: Date.now()
    }
    const updated = [newSaved, ...savedContent]
    setSavedContent(updated)
    localStorage.setItem('ai-saved-content', JSON.stringify(updated))
    alert('✅ Content saved to favorites!')
  }

  function loadSavedContent(id: string) {
    const item = savedContent.find(s => s.id === id)
    if (item) {
      setGeneratedContent(item.content)
      setContentType(item.type as any)
    }
  }

  function deleteSavedContent(id: string) {
    const updated = savedContent.filter(s => s.id !== id)
    setSavedContent(updated)
    localStorage.setItem('ai-saved-content', JSON.stringify(updated))
  }

  // Load saved content on mount
  useState(() => {
    try {
      const saved = localStorage.getItem('ai-saved-content')
      if (saved) {
        setSavedContent(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load saved content:', e)
    }
  })

  function renderPreview() {
    // Design variants for visual variety
    const gradients = [
      'from-blue-600 via-purple-600 to-green-500',
      'from-pink-500 via-red-500 to-yellow-500',
      'from-indigo-600 via-purple-600 to-pink-600',
      'from-green-500 via-teal-500 to-blue-600',
      'from-orange-500 via-red-600 to-pink-600',
    ]
    
    const buttonColors = [
      'bg-yellow-400 hover:bg-yellow-300 text-gray-900',
      'bg-green-500 hover:bg-green-400 text-white',
      'bg-pink-500 hover:bg-pink-400 text-white',
      'bg-orange-500 hover:bg-orange-400 text-white',
      'bg-blue-500 hover:bg-blue-400 text-white',
    ]
    
    const layouts = [
      'text-center',
      'text-left',
      'text-center',
      'text-left',
      'text-center',
    ]
    
    const cardStyles = [
      'bg-white/10 backdrop-blur-lg rounded-xl border border-white/20',
      'bg-white/20 backdrop-blur-md rounded-2xl border-2 border-white/30 shadow-xl',
      'bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/30',
      'bg-black/20 backdrop-blur-sm rounded-xl border border-white/10',
      'bg-white/15 backdrop-blur-lg rounded-2xl border border-white/40 shadow-2xl',
    ]
    
    const gradient = gradients[designVariant % gradients.length]
    const buttonColor = buttonColors[designVariant % buttonColors.length]
    const layout = layouts[designVariant % layouts.length]
    const cardStyle = cardStyles[designVariant % cardStyles.length]
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(generatedContent)
      
      // Check if it's a landing page structure
      if (parsed.headline || parsed.benefits || parsed.cta) {
        
        // Layout Variant 1: Traditional Center-aligned
        if (designVariant === 0) {
          return (
            <div className={`bg-gradient-to-br ${gradient} rounded-lg p-12 text-center space-y-8`}>
              {parsed.headline && (
                <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4">
                  {parsed.headline}
                </h1>
              )}
              {parsed.subheadline && (
                <p className="text-2xl text-white font-semibold opacity-90 max-w-3xl mx-auto">
                  {parsed.subheadline}
                </p>
              )}
              {parsed.benefits && Array.isArray(parsed.benefits) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  {parsed.benefits.map((benefit: any, index: number) => (
                    <div key={index} className={`${cardStyle} p-8 text-center`}>
                      <div className="text-4xl mb-4">✨</div>
                      <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                      <p className="text-white/90">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {parsed.cta && (
                <button className={`mt-12 px-12 py-5 ${buttonColor} text-2xl font-bold rounded-full transition-all transform hover:scale-110 shadow-2xl`}>
                  {parsed.cta} →
                </button>
              )}
            </div>
          )
        }
        
        // Layout Variant 2: Left-aligned with Hero Image Placeholder
        if (designVariant === 1) {
          return (
            <div className={`bg-gradient-to-br ${gradient} rounded-lg overflow-hidden`}>
              <div className="grid md:grid-cols-2 gap-8 p-12">
                <div className="space-y-6">
                  {parsed.headline && (
                    <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                      {parsed.headline}
                    </h1>
                  )}
                  {parsed.subheadline && (
                    <p className="text-xl text-white/90">{parsed.subheadline}</p>
                  )}
                  {parsed.cta && (
                    <button className={`px-8 py-4 ${buttonColor} text-lg font-bold rounded-lg transition-all shadow-xl`}>
                      {parsed.cta}
                    </button>
                  )}
                </div>
                <div className="bg-white/20 rounded-xl flex items-center justify-center p-8">
                  <div className="text-white/50 text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <p className="text-sm">Hero Image</p>
                  </div>
                </div>
              </div>
              {parsed.benefits && Array.isArray(parsed.benefits) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-12 pt-0">
                  {parsed.benefits.map((benefit: any, index: number) => (
                    <div key={index} className={`${cardStyle} p-6`}>
                      <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                      <p className="text-white/80 text-sm">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }
        
        // Layout Variant 3: Feature Cards with Numbers
        if (designVariant === 2) {
          return (
            <div className={`bg-gradient-to-br ${gradient} rounded-lg p-12 space-y-12`}>
              <div className="text-center space-y-4">
                {parsed.headline && (
                  <h1 className="text-5xl font-extrabold text-white">{parsed.headline}</h1>
                )}
                {parsed.subheadline && (
                  <p className="text-xl text-white/90 max-w-2xl mx-auto">{parsed.subheadline}</p>
                )}
              </div>
              {parsed.benefits && Array.isArray(parsed.benefits) && (
                <div className="space-y-6">
                  {parsed.benefits.map((benefit: any, index: number) => (
                    <div key={index} className={`${cardStyle} p-8 flex gap-6 items-start`}>
                      <div className="text-5xl font-bold text-white/30 min-w-[60px]">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-3">{benefit.title}</h3>
                        <p className="text-white/90 text-lg">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {parsed.cta && (
                <div className="text-center">
                  <button className={`px-10 py-4 ${buttonColor} text-xl font-bold rounded-lg transition-all transform hover:scale-105 shadow-2xl`}>
                    {parsed.cta}
                  </button>
                </div>
              )}
            </div>
          )
        }
        
        // Layout Variant 4: Minimal Clean Design
        if (designVariant === 3) {
          return (
            <div className="bg-white rounded-lg p-12 space-y-10">
              <div className="text-center space-y-6 border-b-4 border-gray-200 pb-10">
                {parsed.headline && (
                  <h1 className={`text-5xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                    {parsed.headline}
                  </h1>
                )}
                {parsed.subheadline && (
                  <p className="text-xl text-gray-700 max-w-3xl mx-auto">{parsed.subheadline}</p>
                )}
              </div>
              {parsed.benefits && Array.isArray(parsed.benefits) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {parsed.benefits.map((benefit: any, index: number) => (
                    <div key={index} className="text-center space-y-3">
                      <div className={`inline-block p-4 rounded-full bg-gradient-to-br ${gradient} text-white text-2xl`}>
                        {['🎯', '⚡', '🌟'][index] || '✨'}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {parsed.cta && (
                <div className="text-center pt-6">
                  <button className={`px-10 py-4 bg-gradient-to-r ${gradient} text-white text-xl font-bold rounded-full transition-all transform hover:scale-105 shadow-xl`}>
                    {parsed.cta}
                  </button>
                </div>
              )}
            </div>
          )
        }
        
        // Layout Variant 5: Card-based Stacked Design
        if (designVariant === 4) {
          return (
            <div className={`bg-gradient-to-br ${gradient} rounded-lg p-8 space-y-6`}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 text-center border-2 border-white/30">
                {parsed.headline && (
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    {parsed.headline}
                  </h1>
                )}
                {parsed.subheadline && (
                  <p className="text-lg text-white/90">{parsed.subheadline}</p>
                )}
              </div>
              {parsed.benefits && Array.isArray(parsed.benefits) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {parsed.benefits.map((benefit: any, index: number) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-xl">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className={`inline-block w-8 h-8 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center text-white text-sm`}>
                          {index + 1}
                        </span>
                        {benefit.title}
                      </h3>
                      <p className="text-gray-700">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {parsed.cta && (
                <div className="text-center pt-4">
                  <button className={`px-10 py-4 ${buttonColor} text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-2xl`}>
                    {parsed.cta} ✨
                  </button>
                </div>
              )}
            </div>
          )
        }
        
        // Default fallback
        return (
          <div className={`bg-gradient-to-br ${gradient} rounded-lg p-12 ${layout} space-y-8`}>
            {/* Headline */}
            {parsed.headline && (
              <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
                {parsed.headline}
              </h1>
            )}
            
            {/* Subheadline */}
            {parsed.subheadline && (
              <p className="text-xl md:text-2xl text-white font-semibold opacity-90">
                {parsed.subheadline}
              </p>
            )}
            
            {/* Benefits */}
            {parsed.benefits && Array.isArray(parsed.benefits) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {parsed.benefits.map((benefit: any, index: number) => (
                  <div key={index} className={`${cardStyle} p-6`}>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-white/90">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Bullet Points */}
            {parsed.bulletPoints && Array.isArray(parsed.bulletPoints) && (
              <ul className={`${layout === 'text-left' ? 'text-left' : 'text-left'} max-w-2xl ${layout === 'text-center' ? 'mx-auto' : ''} space-y-3 text-white text-lg`}>
                {parsed.bulletPoints.map((point: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-yellow-400 text-xl">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {/* CTA */}
            {parsed.cta && (
              <button className={`mt-8 px-10 py-4 ${buttonColor} text-xl font-bold rounded-lg transition-all transform hover:scale-105 shadow-2xl`}>
                {parsed.cta}
              </button>
            )}
          </div>
        )
      }
      
      // Fallback for other JSON structures
      return (
        <div className="bg-white rounded-lg p-8">
          <pre className="text-gray-800 whitespace-pre-wrap font-sans">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        </div>
      )
    } catch (e) {
      // Not JSON, render as plain text with formatting
      return (
        <div className="bg-white rounded-lg p-8 prose prose-lg max-w-none">
          <div 
            className="text-gray-800"
            dangerouslySetInnerHTML={{ 
              __html: generatedContent.replace(/\n/g, '<br/>') 
            }}
          />
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            AI Content Generator
          </h1>
          <p className="text-blue-200">Create high-converting copy with AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Generate Content</h2>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Content Type */}
              <div>
                <label className="block text-white mb-2 font-semibold">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-yellow-400 focus:outline-none"
                >
                  <option value="headline" className="bg-gray-800 text-white">Headline</option>
                  <option value="subheadline" className="bg-gray-800 text-white">Subheadline</option>
                  <option value="cta" className="bg-gray-800 text-white">Call-to-Action</option>
                  <option value="bullet-points" className="bg-gray-800 text-white">Bullet Points</option>
                  <option value="full-page" className="bg-gray-800 text-white">Full Landing Page</option>
                  <option value="email" className="bg-gray-800 text-white">Email Copy</option>
                </select>
              </div>

              {/* Niche */}
              <div>
                <label className="block text-white mb-2 font-semibold">Niche</label>
                <input
                  type="text"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  placeholder="e.g., Health & Fitness, Finance, Tech"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:border-yellow-400 focus:outline-none"
                  required
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-white mb-2 font-semibold">Product/Offer Name</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g., Weight Loss Program, Trading Course"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:border-yellow-400 focus:outline-none"
                  required
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-white mb-2 font-semibold">Target Audience</label>
                <input
                  type="text"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  placeholder="e.g., Busy professionals, New moms, Beginners"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:border-yellow-400 focus:outline-none"
                  required
                />
              </div>

              {/* Tone */}
              <div>
                <label className="block text-white mb-2 font-semibold">Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-yellow-400 focus:outline-none"
                >
                  <option value="professional" className="bg-gray-800 text-white">Professional</option>
                  <option value="casual" className="bg-gray-800 text-white">Casual</option>
                  <option value="urgent" className="bg-gray-800 text-white">Urgent</option>
                  <option value="friendly" className="bg-gray-800 text-white">Friendly</option>
                </select>
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-white mb-2 font-semibold">Additional Context (Optional)</label>
                <textarea
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  placeholder="Any additional details or specific angles..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:border-yellow-400 focus:outline-none"
                />
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loading ? '✨ Generating...' : '✨ Generate Content'}
              </button>
            </form>
          </div>

          {/* Output */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Generated Content</h2>
              <div className="flex items-center gap-2">
                {generatedContent && (
                  <>
                    <div className="flex bg-white/20 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('preview')}
                        className={`px-3 py-1 rounded transition ${
                          viewMode === 'preview'
                            ? 'bg-yellow-400 text-gray-900'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        👁️ Preview
                      </button>
                      <button
                        onClick={() => setViewMode('code')}
                        className={`px-3 py-1 rounded transition ${
                          viewMode === 'code'
                            ? 'bg-yellow-400 text-gray-900'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        💻 Code
                      </button>
                    </div>
                    <button
                      onClick={saveContent}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                    >
                      ⭐ Save
                    </button>
                    <button
                      onClick={() => setDesignVariant(Math.floor(Math.random() * 5))}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition"
                      title="Change visual design"
                    >
                      🎨 New Style
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition"
                    >
                      📋 Copy
                    </button>
                  </>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
                <p className="text-blue-200">AI is crafting your content...</p>
              </div>
            ) : generatedContent ? (
              <div className="min-h-[400px]">
                {viewMode === 'preview' ? (
                  renderPreview()
                ) : (
                  <div className="bg-black/30 rounded-lg p-6">
                    <pre className="text-white whitespace-pre-wrap font-mono text-sm overflow-x-auto">
                      {generatedContent}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-blue-200 text-lg">
                  Fill out the form and click "Generate Content" to create AI-powered copy
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Saved Content */}
        {savedContent.length > 0 && (
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">⭐ Saved Favorites ({savedContent.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedContent.map((item) => (
                <div key={item.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-200 uppercase font-semibold">{item.type}</span>
                    <span className="text-xs text-blue-300">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-white text-sm mb-3 line-clamp-3 overflow-hidden">
                    {item.content.substring(0, 100)}...
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadSavedContent(item.id)}
                      className="flex-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteSavedContent(item.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">💡 Tips for Better Results</h3>
          <ul className="space-y-2 text-blue-200">
            <li>• Be specific about your niche and target audience</li>
            <li>• Include key benefits or features in the context field</li>
            <li>• Try different tones to see what resonates best</li>
            <li>• Generate multiple versions and pick the best one</li>
            <li>• Use "Full Landing Page" to get a complete set of copy</li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition border border-white/20"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
