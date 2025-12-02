import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getConcatenatedSystemPrompt } from '../lib/api'
import OpenAI from 'openai'

const chatSampleTexts = [
  'hi! my name is george washington.',
  'what is boba made of?',
  'i had a bad day and want to talk about it',
  'my favorite color is yellow',
  'hiiiiiii',
  'hi, i need someone to talk to',
  'i had a great day today! can i tell you about it?',
]

const CornerDownRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <polyline points="15 10 20 15 15 20" />
    <path d="M4 4v7a4 4 0 0 0 4 4h12" />
  </svg>
)

export default function ChatPage() {
  const [showTitle, setShowTitle] = useState(false)
  const [showChatbox, setShowChatbox] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState<string>('')
  const [placeholderText] = useState(() => chatSampleTexts[Math.floor(Math.random() * chatSampleTexts.length)])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Title fades in
    const titleTimer = setTimeout(() => {
      setShowTitle(true)
    }, 1000)

    // Chatbox fades in after title
    const chatboxTimer = setTimeout(() => {
      setShowChatbox(true)
      loadSystemPrompt()
    }, 2000)

    return () => {
      clearTimeout(titleTimer)
      clearTimeout(chatboxTimer)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadSystemPrompt = async () => {
    try {
      const prompt = await getConcatenatedSystemPrompt()
      setSystemPrompt(prompt || '')
    } catch (error) {
      console.error('Error loading system prompt:', error)
      setSystemPrompt('')
    }
  }

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || ''

      if (!AI_API_KEY) {
        throw new Error('API key not configured. Please set VITE_AI_API_KEY in your .env file.')
      }

      const openai = new OpenAI({
        apiKey: AI_API_KEY,
        dangerouslyAllowBrowser: true,
      })

      console.log('[AI #2] Sending chat message:', userMessage.substring(0, 50) + '...')
      console.log('[AI #2] API Key present:', !!AI_API_KEY)
      console.log('[AI #2] API Key preview:', AI_API_KEY ? `${AI_API_KEY.substring(0, 7)}...` : 'MISSING')
      console.log('[AI #2] System prompt length:', systemPrompt?.length || 0)

      const response = await openai.responses.create({
        model: 'gpt-5-nano-2025-08-07',
        reasoning: { effort: 'low' },
        instructions: systemPrompt || '',
        input: userMessage,
      })

      const assistantMessage = response.output_text?.trim() || 'Sorry, I could not generate a response.'
      console.log('[AI #2] Received response:', assistantMessage.substring(0, 50) + '...')
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])
    } catch (error: any) {
      console.error('[AI #2] Error getting AI response:', error)
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.'
      
      if (error?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.'
      } else if (error?.status === 401) {
        errorMessage = 'Invalid API key. Please check your VITE_AI_API_KEY in .env file.'
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl px-8 -mt-16">
        {/* Title */}
        <div className={`pb-8 text-center transition-opacity duration-1000 ${showTitle ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-4xl font-semibold text-[#0a0a0a]">
            THIS MACHINE BUILDS THE FUTURE
          </h1>
        </div>

        {/* Chat interface */}
        <div className={`transition-opacity duration-700 ${showChatbox ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col" style={{ width: 'calc(100% - 4rem)', margin: '0 auto' }}>
            {/* Messages area */}
            <div className="border border-[#1a1a1a] rounded bg-[#fafafa] mb-2 min-h-[400px] max-h-[500px] overflow-y-auto p-4">
              {messages.length === 0 ? (
                <p className="text-[#b5b5b5] text-sm">start a conversation...</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`${
                        msg.role === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <p
                        className={`inline-block p-2 rounded ${
                          msg.role === 'user'
                            ? 'bg-[#1a1a1a] text-[#fafafa]'
                            : 'bg-[#e5e5e5] text-[#1a1a1a]'
                        }`}
                      >
                        {msg.content}
                      </p>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="text-left">
                      <p className="inline-block p-2 rounded bg-[#e5e5e5] text-[#1a1a1a]">
                        thinking...
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 pr-12 border border-[#1a1a1a] rounded bg-[#fafafa] resize-none focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] placeholder:text-[#b5b5b5]"
                style={{ color: inputValue ? '#0a0a0a' : '#b5b5b5' }}
                rows={2}
                placeholder={placeholderText}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !inputValue.trim()}
                className="group absolute bottom-2 right-1 h-8 w-8 flex items-center justify-center rounded text-[#b5b5b5] hover:text-[#222222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <CornerDownRightIcon />
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      {/* Return home link */}
      <div className="pb-8 text-center">
        <Link
          to="/"
          className="text-xs italic underline text-[#888888] hover:text-[#444444] transition-colors"
        >
          return home
        </Link>
      </div>
    </div>
  )
}

