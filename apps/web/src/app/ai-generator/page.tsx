'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function AIGeneratorPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string>('')
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
              {generatedContent && (
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition"
                >
                  📋 Copy
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
                <p className="text-blue-200">AI is crafting your content...</p>
              </div>
            ) : generatedContent ? (
              <div className="bg-black/30 rounded-lg p-6 min-h-[300px]">
                <pre className="text-white whitespace-pre-wrap font-sans">{generatedContent}</pre>
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
