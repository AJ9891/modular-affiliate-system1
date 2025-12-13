'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface ChatAction {
  action: 'CREATE_CHECKOUT' | 'VIEW_PRICING' | 'START_TRIAL'
  plan?: 'starter' | 'pro' | 'agency'
}

interface AIChatWidgetProps {
  mode?: 'support' | 'sales'
}

export default function AIChatWidget({ mode = 'support' }: AIChatWidgetProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setUserId(data.user?.id || null)
      } else {
        setIsAuthenticated(false)
      }
    } catch {
      setIsAuthenticated(false)
    }
  }

  function parseActionFromResponse(content: string): { text: string; action: ChatAction | null } {
    const actionMatch = content.match(/ACTION:\s*({[^}]+})/i)
    if (!actionMatch) {
      return { text: content, action: null }
    }

    try {
      const action = JSON.parse(actionMatch[1]) as ChatAction
      const text = content.replace(/ACTION:\s*{[^}]+}/i, '').trim()
      return { text, action }
    } catch {
      return { text: content, action: null }
    }
  }

  async function handleAction(action: ChatAction) {
    switch (action.action) {
      case 'CREATE_CHECKOUT':
        if (action.plan) {
          router.push(`/checkout?plan=${action.plan}`)
        }
        break
      case 'VIEW_PRICING':
        router.push('/pricing')
        break
      case 'START_TRIAL':
        router.push('/signup')
        break
    }
  }

  async function loadConversation() {
    if (!conversationId) return

    try {
      const response = await fetch(`/api/chat?conversationId=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
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
      if (mode === 'sales') {
        // Sales bot with streaming
        const response = await fetch('/api/sales-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages.map(m => ({ role: m.role, content: m.content })).concat([
              { role: 'user', content: userMessage }
            ]),
            sessionId,
            userId
          })
        })

        if (!response.ok) throw new Error('Failed to send message')

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullResponse = ''

        // Create placeholder for streaming response
        const assistantMsgId = `assistant-${Date.now()}`
        setMessages(prev => [...prev, {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          created_at: new Date().toISOString()
        }])

        // Stream the response
        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            fullResponse += chunk

            // Update message with streamed content
            setMessages(prev => prev.map(m => 
              m.id === assistantMsgId ? { ...m, content: fullResponse } : m
            ))
          }
        }

        // Parse and handle any actions
        const { text, action } = parseActionFromResponse(fullResponse)
        
        // Update final message with cleaned text
        setMessages(prev => prev.map(m => 
          m.id === assistantMsgId ? { ...m, content: text } : m
        ))

        // Execute action if present
        if (action) {
          await handleAction(action)
        }
      } else {
        // Support bot (existing logic)
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            message: userMessage
          })
        })

        if (!response.ok) throw new Error('Failed to send message')

        const data = await response.json()
        
        if (!conversationId) {
          setConversationId(data.conversationId)
        }

        setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), 
          tempUserMsg, 
          data.message
        ])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
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

  // Show sales mode for everyone, support mode only for authenticated users
  if (mode === 'support' && !isAuthenticated) {
    return null
  }

  const isSalesMode = mode === 'sales'
  const chatTitle = isSalesMode ? 'Launchpad 4 Success' : 'AI Support'
  const chatSubtitle = isSalesMode ? 'How can I help you today?' : 'Always here to help'
  const chatIcon = isSalesMode ? '🚀' : '🤖'
  const gradientColors = isSalesMode 
    ? 'from-brand-purple to-brand-cyan' 
    : 'from-purple-600 to-blue-600'

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r ${gradientColors} text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110`}
          aria-label={`Open ${isSalesMode ? 'sales' : 'support'} chat`}
        >
          <span className="text-2xl">{chatIcon}</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className={`bg-gradient-to-r ${gradientColors} text-white p-4 rounded-t-2xl flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">{chatIcon}</span>
              </div>
              <div>
                <h3 className="font-bold">{chatTitle}</h3>
                <p className="text-xs text-white/80">{chatSubtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isSalesMode && conversationId && (
                <button
                  onClick={escalateToHumanSupport}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Escalate to human support"
                >
                  <span className="text-lg">🙋</span>
                </button>
              )}
              {messages.length > 0 && (
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
                <div className="text-6xl mb-4">👋</div>
                <h4 className="font-bold text-gray-900 mb-2">Hi! How can I help?</h4>
                <p className="text-sm text-gray-600">
                  {isSalesMode 
                    ? 'Ask me anything about Launchpad 4 Success!'
                    : 'Ask me anything about Launchpad4Success!'}
                </p>
                <div className="mt-6 space-y-2">
                  {isSalesMode ? (
                    <>
                      <button
                        onClick={() => setInput("I'm interested in affiliate marketing but don't know where to start")}
                        className="block w-full text-left px-4 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-purple-50 border border-gray-200"
                      >
                        I'm new to affiliate marketing
                      </button>
                      <button
                        onClick={() => setInput('What are your plans and pricing?')}
                        className="block w-full text-left px-4 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-purple-50 border border-gray-200"
                      >
                        What are your plans?
                      </button>
                      <button
                        onClick={() => setInput('How does Launchpad compare to other tools?')}
                        className="block w-full text-left px-4 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-purple-50 border border-gray-200"
                      >
                        How does this compare to other tools?
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setInput('How do I create a funnel?')}
                        className="block w-full text-left px-4 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-purple-50 border border-gray-200"
                      >
                        How do I create a funnel?
                      </button>
                      <button
                        onClick={() => setInput('What features are in each plan?')}
                        className="block w-full text-left px-4 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-purple-50 border border-gray-200"
                      >
                        What features are in each plan?
                      </button>
                      <button
                        onClick={() => setInput('How do I set up my custom domain?')}
                        className="block w-full text-left px-4 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-purple-50 border border-gray-200"
                      >
                        How do I set up my custom domain?
                      </button>
                    </>
                  )}
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
                placeholder="Type your message..."
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
                {isSalesMode ? 'AI-powered sales assistant' : 'AI-powered support'}
              </p>
              {!isSalesMode && conversationId && (
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
