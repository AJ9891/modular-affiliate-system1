'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { isPublicPath } from '@/config/publicPaths'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export default function AIChatWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isLaunchpadPath = pathname === '/launchpad' || pathname.startsWith('/launchpad/')
  const shouldShowVision = !isPublicPath(pathname) && !isLaunchpadPath
  const suggestedPrompts = getVisionPrompts(pathname)

  useEffect(() => {
    if (!shouldShowVision) {
      setIsOpen(false)
      setIsAuthenticated(false)
      return
    }

    checkAuth()
  }, [shouldShowVision])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/me')
      setIsAuthenticated(response.ok)
    } catch {
      setIsAuthenticated(false)
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Add user message to UI immediately
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: userMessage
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      // Update conversation ID if new
      if (!conversationId) {
        setConversationId(data.conversationId)
      }

      // Add AI response
      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), 
        tempUserMsg, 
        data.message
      ])
    } catch (error) {
      console.error('Failed to send message:', error)
      // Add error message
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function startNewConversation() {
    setConversationId(null)
    setMessages([])
  }

  async function escalateToHumanSupport() {
    if (!conversationId) {
      alert('Please start a conversation first before escalating to human support.')
      return
    }

    if (!confirm('This will escalate your conversation to human support. A support agent will receive the full chat history and contact you via email. Continue?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/chat?conversationId=${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'escalated',
          escalate: true
        })
      })

      if (response.ok) {
        // Add confirmation message to chat
        setMessages(prev => [...prev, {
          id: `escalation-${Date.now()}`,
          role: 'assistant',
          content: '✅ Your conversation has been escalated to human support. A support agent has received:\n\n• Your complete conversation history\n• Your account details\n• Everything the AI has already tried\n\nWe\'ll contact you via email within 24 hours. Thank you for your patience!',
          created_at: new Date().toISOString()
        }])
      } else {
        throw new Error('Failed to escalate')
      }
    } catch (error) {
      console.error('Escalation error:', error)
      alert('Failed to escalate to human support. Please try again or email support@affiliatelaunchpad.com directly.')
    } finally {
      setLoading(false)
    }
  }

  if (!shouldShowVision || !isAuthenticated) {
    return null // Don't show chat for unauthenticated users
  }

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
          aria-label="Open Vision assistant"
        >
          <span className="text-2xl">⚓</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">⚓</span>
              </div>
              <div>
                <h3 className="font-bold">Vision (Beta)</h3>
                <p className="text-xs text-white/80">20% mode: quick guidance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {conversationId && (
                <button
                  onClick={escalateToHumanSupport}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Escalate to human support"
                >
                  <span className="text-lg">🙋</span>
                </button>
              )}
              {conversationId && (
                <button
                  onClick={startNewConversation}
                  className="text-white/80 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10"
                  title="New conversation"
                >
                  ➕
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white text-xl"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛰️</div>
                <h4 className="font-bold text-gray-900 mb-2">Vision online. What should we optimize?</h4>
                <p className="text-sm text-gray-600">
                  Lightweight copilot across private pages (outside Launchpad).
                </p>
                <div className="mt-6 space-y-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="block w-full text-left px-4 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-purple-50 border border-gray-200"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Vision..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '...' : '→'}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Vision beta chat
              </p>
              {conversationId && (
                <button
                  onClick={escalateToHumanSupport}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  disabled={loading}
                >
                  Need human help? 🙋
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function getVisionPrompts(pathname: string): string[] {
  if (pathname.startsWith('/cockpit')) {
    return [
      'Give me a quick cockpit system check.',
      'Which module should I focus on right now?',
      'What should I optimize first for conversions?',
    ]
  }

  if (pathname.startsWith('/radar') || pathname.startsWith('/analytics')) {
    return [
      'Summarize what matters most in this data.',
      'Where is conversion loss likely happening?',
      'Give me 3 fast tests to run this week.',
    ]
  }

  if (pathname.startsWith('/domains')) {
    return [
      'Give me a domain setup checklist.',
      'How do I verify SSL and routing fast?',
      'What can break tracking on domain changes?',
    ]
  }

  if (pathname.startsWith('/subscription') || pathname.startsWith('/checkout')) {
    return [
      'Explain plan differences in plain language.',
      'How do I reduce checkout drop-off?',
      'What billing issue should I watch for first?',
    ]
  }

  return [
    'What should I do next on this page?',
    'Give me a short optimization plan.',
    'What is the highest-impact action right now?',
  ]
}
