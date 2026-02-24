'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useAIConsent } from '@/components/ai/consent-dialog'

export default function AIGeneratorPage() {
  const { user, loading: authLoading } = useAuth()
  const { requestConsent, ConsentDialog } = useAIConsent()
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
      <div className="cockpit-shell page-ai-core flex items-center justify-center">
        <div className="text-xl text-text-secondary">Loading AI core...</div>
      </div>
    )
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    
    // Request consent for AI generation
    requestConsent({
      type: "generate",
      description: `${contentType} for ${formData.productName || 'your product'}`,
      onConfirm: () => performGeneration(),
      onManualOverride: () => {
        // User chose manual override - show them a form or editor
        setGeneratedContent('// Manual content creation mode\n// Write your content here...')
        setViewMode('code')
      }
    })
  }

  async function performGeneration() {
    setLoading(true)
    setGeneratedContent('')

    try {
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contentType,
          action: 'generate',
          hasConsent: true,
          ...formData,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        
        // Handle AI guidelines violations gracefully
        if (error.issues) {
          alert(`Content generation failed due to guidelines: ${error.issues.join(', ')}`)
        } else {
          alert(error.error || 'Failed to generate content')
        }
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
          <div className="hud-card bg-[rgba(255,255,255,0.96)] text-slate-900">
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
              <ul className="max-w-2xl space-y-3 text-white text-lg">
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
              <button className="mt-8 px-10 py-4 bg-yellow-400 hover:bg-yellow-300 text-xl font-bold rounded-lg transition-all transform hover:scale-105 shadow-2xl text-gray-900">
                {parsed.cta}
              </button>
            )}
          </div>
        )
      }
      
      // Fallback for other JSON structures
      return (
        <div className="hud-card bg-[rgba(255,255,255,0.96)] text-slate-900">
          <pre className="text-gray-800 whitespace-pre-wrap font-sans">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        </div>
      )
    } catch (e) {
      // Not JSON, render as plain text with formatting
      return (
        <div className="hud-card prose prose-lg max-w-none bg-[rgba(255,255,255,0.96)] text-slate-900">
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
    <div className="cockpit-shell page-ai-core py-12">
      <div className="cockpit-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-semibold text-text-primary">
            AI Core Chamber
          </h1>
          <p className="text-text-secondary">Activate onboard intelligence and generate conversion-ready copy.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="hud-card">
            <h2 className="mb-6 text-2xl font-semibold text-text-primary">Personality & Prompting</h2>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Content Type */}
              <div>
                <label className="mb-2 block font-semibold text-text-secondary">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="hud-select"
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
                <label className="mb-2 block font-semibold text-text-secondary">Niche</label>
                <input
                  type="text"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  placeholder="e.g., Health & Fitness, Finance, Tech"
                  className="hud-input"
                  required
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="mb-2 block font-semibold text-text-secondary">Product/Offer Name</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g., Weight Loss Program, Trading Course"
                  className="hud-input"
                  required
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="mb-2 block font-semibold text-text-secondary">Target Audience</label>
                <input
                  type="text"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  placeholder="e.g., Busy professionals, New moms, Beginners"
                  className="hud-input"
                  required
                />
              </div>

              {/* Tone */}
              <div>
                <label className="mb-2 block font-semibold text-text-secondary">Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
                  className="hud-select"
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
                <label className="mb-2 block font-semibold text-text-secondary">Additional Context (Optional)</label>
                <textarea
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  placeholder="Any additional details or specific angles..."
                  rows={3}
                  className="hud-textarea"
                />
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={loading}
                className="hud-button-primary w-full px-6 py-4 text-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? '✨ Generating...' : '✨ Generate Content'}
              </button>
            </form>
          </div>

          {/* Output */}
          <div className="hud-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-text-primary">Core Output</h2>
              <div className="flex items-center gap-2">
                {generatedContent && (
                  <>
                    <div className="flex rounded-lg border border-[var(--border-subtle)] bg-[rgba(14,22,30,0.5)] p-1">
                      <button
                        onClick={() => setViewMode('preview')}
                        className={`px-3 py-1 rounded transition ${
                          viewMode === 'preview'
                            ? 'bg-rocket-500 text-slate-950'
                            : 'text-text-secondary hover:bg-[rgba(255,255,255,0.06)]'
                        }`}
                      >
                        👁️ Preview
                      </button>
                      <button
                        onClick={() => setViewMode('code')}
                        className={`px-3 py-1 rounded transition ${
                          viewMode === 'code'
                            ? 'bg-rocket-500 text-slate-950'
                            : 'text-text-secondary hover:bg-[rgba(255,255,255,0.06)]'
                        }`}
                      >
                        💻 Code
                      </button>
                    </div>
                    <button
                      onClick={saveContent}
                      className="hud-button-secondary px-4 py-2"
                    >
                      ⭐ Save
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="hud-button-secondary px-4 py-2"
                    >
                      📋 Copy
                    </button>
                  </>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-rocket-500"></div>
                <p className="text-text-secondary">AI core is crafting your content...</p>
              </div>
            ) : generatedContent ? (
              <div className="min-h-[400px]">
                {viewMode === 'preview' ? (
                  renderPreview()
                ) : (
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(8,14,21,0.78)] p-6">
                    <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm text-text-primary">
                      {generatedContent}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-lg text-text-secondary">
                  Fill out the form and click "Generate Content" to create AI-powered copy
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Saved Content */}
        {savedContent.length > 0 && (
          <div className="hud-card mt-8">
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">Saved Favorites ({savedContent.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedContent.map((item) => (
                <div key={item.id} className="hud-card-tight p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-semibold text-text-secondary">{item.type}</span>
                    <span className="text-xs text-text-muted">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mb-3 line-clamp-3 overflow-hidden text-sm text-text-primary">
                    {item.content.substring(0, 100)}...
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadSavedContent(item.id)}
                      className="hud-button-secondary flex-1 px-3 py-1 text-sm"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteSavedContent(item.id)}
                      className="hud-button-danger px-3 py-1 text-sm"
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
        <div className="hud-card mt-8">
          <h3 className="mb-4 text-xl font-semibold text-text-primary">Tips for Better Results</h3>
          <ul className="space-y-2 text-text-secondary">
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
            className="hud-button-secondary inline-block px-8 py-3"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
      
      {/* AI Consent Dialog */}
      <ConsentDialog />
    </div>
  )
}
