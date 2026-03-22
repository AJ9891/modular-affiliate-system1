'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bot, Code2, Copy, Eye, Loader2, Palette, Save, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useBrandMode } from '@/contexts/BrandModeContext'
import { getBrandModeTheme } from '@/lib/brand/brandModeTheme'

export default function AIGeneratorPage() {
  const { loading: authLoading } = useAuth()
  const { mode } = useBrandMode()
  const activeTheme = getBrandModeTheme(mode)
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
      <div className="page-ai-core min-h-screen flex items-center justify-center">
        <div className="text-text-secondary text-xl">Loading generator...</div>
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
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-saved-content')
      if (saved) {
        setSavedContent(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load saved content:', e)
    }
  }, [])

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
    <main className="page-ai-core min-h-screen">
      <div className="cockpit-container max-w-7xl space-y-8 py-10">
        <header className="hud-panel space-y-4">
          <p className="text-[12px] uppercase tracking-system text-text-secondary">Intelligence Core</p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[34px] font-semibold tracking-[-0.02em] text-text-primary md:text-[44px]">
                AI Content Generator
              </h1>
              <p className="mt-2 max-w-3xl text-[15px] leading-[1.65] text-text-secondary">
                Build conversion-focused copy, preview it in multiple layouts, and keep your best outputs in favorites.
              </p>
            </div>
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-system"
              style={{
                borderColor: activeTheme.borderFocus,
                color: activeTheme.accent,
                background: activeTheme.accentSoft,
              }}
            >
              <Sparkles size={14} />
              {activeTheme.glowLabel}
            </span>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="hud-card">
            <h2 className="mb-6 text-[24px] font-semibold text-text-primary">Generate Content</h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="hud-select"
                >
                  <option value="headline">Headline</option>
                  <option value="subheadline">Subheadline</option>
                  <option value="cta">Call-to-Action</option>
                  <option value="bullet-points">Bullet Points</option>
                  <option value="full-page">Full Landing Page</option>
                  <option value="email">Email Copy</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Niche</label>
                <input
                  type="text"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  placeholder="e.g., Health & Fitness, Finance, Tech"
                  className="hud-input"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Product / Offer Name</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g., Weight Loss Program, Trading Course"
                  className="hud-input"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Target Audience</label>
                <input
                  type="text"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  placeholder="e.g., Busy professionals, New moms, Beginners"
                  className="hud-input"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
                  className="hud-select"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="urgent">Urgent</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Additional Context</label>
                <textarea
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  placeholder="Any additional details or specific angles..."
                  rows={3}
                  className="hud-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-55"
                style={{
                  color: '#06111c',
                  background: `linear-gradient(120deg, ${activeTheme.accent}, rgba(${activeTheme.accentRgb}, 0.72))`,
                  boxShadow: `0 10px 26px rgba(${activeTheme.accentRgb}, 0.35)`,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Generate Content
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="hud-card">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[24px] font-semibold text-text-primary">Generated Content</h2>
              {generatedContent && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="hud-card-tight flex items-center gap-1 p-1">
                    <button
                      onClick={() => setViewMode('preview')}
                      className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition"
                      style={
                        viewMode === 'preview'
                          ? {
                              border: `1px solid ${activeTheme.borderFocus}`,
                              background: activeTheme.accentSoft,
                              color: activeTheme.accent,
                            }
                          : {}
                      }
                    >
                      <Eye size={13} />
                      Preview
                    </button>
                    <button
                      onClick={() => setViewMode('code')}
                      className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition"
                      style={
                        viewMode === 'code'
                          ? {
                              border: `1px solid ${activeTheme.borderFocus}`,
                              background: activeTheme.accentSoft,
                              color: activeTheme.accent,
                            }
                          : {}
                      }
                    >
                      <Code2 size={13} />
                      Code
                    </button>
                  </div>
                  <button
                    onClick={saveContent}
                    className="hud-button-secondary inline-flex items-center gap-1 px-3 py-2 text-xs"
                    style={{
                      borderColor: activeTheme.borderFocus,
                      background: activeTheme.accentSoft,
                      color: activeTheme.accent,
                    }}
                  >
                    <Save size={13} />
                    Save
                  </button>
                  <button
                    onClick={() => setDesignVariant(Math.floor(Math.random() * 5))}
                    className="hud-button-secondary inline-flex items-center gap-1 px-3 py-2 text-xs"
                    title="Change visual design"
                  >
                    <Palette size={13} />
                    New Style
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="hud-button-secondary inline-flex items-center gap-1 px-3 py-2 text-xs"
                  >
                    <Copy size={13} />
                    Copy
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2
                  className="mb-4 animate-spin"
                  size={36}
                  style={{ color: activeTheme.accent }}
                />
                <p className="text-text-secondary">AI is crafting your content...</p>
              </div>
            ) : generatedContent ? (
              <div className="min-h-[420px] overflow-hidden rounded-xl border border-[var(--border-elevated)]">
                {viewMode === 'preview' ? (
                  renderPreview()
                ) : (
                  <div className="h-full bg-[rgba(5,10,16,0.66)] p-6">
                    <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm text-text-primary">
                      {generatedContent}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Bot className="mb-4 text-text-secondary" size={56} />
                <p className="max-w-md text-[15px] text-text-secondary">
                  Fill out the form and run generation to create AI-powered conversion copy.
                </p>
              </div>
            )}
          </div>
        </section>

        {savedContent.length > 0 && (
          <section className="hud-panel">
            <h3 className="mb-4 text-[22px] font-semibold text-text-primary">Saved Favorites ({savedContent.length})</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedContent.map((item) => (
                <div key={item.id} className="hud-card-tight space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-system text-text-secondary">{item.type}</span>
                    <span className="text-[11px] uppercase tracking-system text-text-muted">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-sm leading-6 text-text-primary">
                    {item.content.substring(0, 120)}...
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadSavedContent(item.id)}
                      className="hud-button-secondary flex-1 px-3 py-2 text-xs"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteSavedContent(item.id)}
                      className="hud-button-danger px-3 py-2 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="hud-panel">
          <h3 className="mb-3 text-[20px] font-semibold text-text-primary">Tips for Better Results</h3>
          <ul className="space-y-2 text-[15px] leading-7 text-text-secondary">
            <li>Be specific about your niche and target audience.</li>
            <li>Include key benefits or differentiators in context.</li>
            <li>Try different tones and compare the outputs.</li>
            <li>Generate multiple variants and combine your best lines.</li>
            <li>Use Full Landing Page for complete copy blocks in one pass.</li>
          </ul>
        </section>

        <div className="pt-1">
          <Link href="/dashboard" className="hud-button-secondary inline-flex items-center gap-2 px-5 py-2.5">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
