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
  const [contentType, setContentType] = useState<'headline' | 'subheadline' | 'cta' | 'bullet-points' | 'full-page' | 'email'>('headline')
  const [formData, setFormData] = useState({
    niche: '',
    productName: '',
    audience: '',
    tone: 'professional' as 'professional' | 'casual' | 'urgent' | 'friendly' | 'funny',
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
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(generatedContent)
      
      // Let AI generate completely custom landing pages - display raw content
      if (parsed.headline || parsed.benefits || parsed.cta) {
        // Render AI-generated content as structured JSON
        return (
          <div className="bg-white rounded-lg p-8">
            <div className="prose prose-lg max-w-none">
              {parsed.headline && (
                <h1 className="text-5xl font-bold text-gray-900 mb-6">{parsed.headline}</h1>
              )}
              
              {parsed.subheadline && (
                <h2 className="text-2xl text-gray-700 mb-6">{parsed.subheadline}</h2>
              )}
              
              {parsed.cta && (
                <p className="text-lg text-gray-600 mb-6 font-semibold">CTA: {parsed.cta}</p>
              )}
              
              {parsed.benefits && Array.isArray(parsed.benefits) && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits:</h3>
                  <ul className="space-y-3">
                    {parsed.benefits.map((benefit: any, index: number) => (
                      <li key={index} className="flex gap-3">
                        <span className="font-bold text-gray-900 min-w-[30px]">{index + 1}.</span>
                        <div>
                          <p className="font-semibold text-gray-900">{benefit.title}</p>
                          <p className="text-gray-700 text-sm">{benefit.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {Object.keys(parsed).length > 0 && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Full AI-Generated JSON:</p>
                  <pre className="text-xs text-gray-800 overflow-x-auto">
                    {JSON.stringify(parsed, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )
        
        // Default fallback
        return (
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-12 space-y-8">
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
                  <div key={index} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6">
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
                  <option value="funny" className="bg-gray-800 text-white">Funny</option>
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
