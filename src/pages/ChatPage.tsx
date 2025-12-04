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

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState<string>('')
  const [ellipsisCount, setEllipsisCount] = useState(0)
  const [placeholderText] = useState(() => chatSampleTexts[Math.floor(Math.random() * chatSampleTexts.length)])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSystemPrompt()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Animated ellipsis for loading state
    let interval: NodeJS.Timeout
    if (isLoading) {
      interval = setInterval(() => {
        setEllipsisCount((prev) => (prev + 1) % 4)
      }, 500)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLoading])

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
    // Clear the contentEditable div
    if (inputRef.current) {
      inputRef.current.textContent = ''
    }
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

  const handleInputChange = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || ''
    setInputValue(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(text))
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    // Update state
    const newText = e.currentTarget.textContent || ''
    setInputValue(newText)
  }

  const getEllipsis = () => {
    return '.'.repeat(ellipsisCount)
  }

  return (
    <div className="min-h-screen bg-base-bg flex flex-col">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-5 md:px-10 z-10 border-b border-border" style={{ backgroundColor: '#0A0A0A' }}>
        <h1 className="text-headline text-2xl md:text-3xl text-base-text">
          THIS MACHINE BUILDS THE FUTURE
        </h1>
        <Link
          to="/"
          className="text-secondary-text hover:text-cyan hover:underline transition-all duration-200 text-sm md:text-base"
          style={{ textDecoration: 'none' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderBottom = '2px solid #00F0FF'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderBottom = 'none'
          }}
        >
          return home
        </Link>
      </header>

      {/* Messages container - fills remaining height, scrollable */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-5 md:px-10 py-5 pt-24 pb-32"
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 ? (
          <p className="text-secondary-text text-sm">start a conversation below...</p>
        ) : (
          <div className="space-y-8">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className="max-w-[70%]"
                  style={{
                    paddingLeft: '15px',
                    borderLeft: `3px solid ${msg.role === 'user' ? '#00F0FF' : '#808080'}`,
                  }}
                >
                  <span className="mr-2" style={{ color: msg.role === 'user' ? '#00F0FF' : '#808080' }}>
                    {msg.role === 'user' ? '>>' : '>>'}
                  </span>
                  <span className="text-base-text" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    {msg.content}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="max-w-[70%]"
                  style={{
                    paddingLeft: '15px',
                    borderLeft: '3px solid #808080',
                  }}
                >
                  <span className="mr-2" style={{ color: '#808080' }}>&gt;&gt;</span>
                  <span className="text-base-text" style={{ fontSize: '16px' }}>
                    {getEllipsis()}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed input area at bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border p-5 z-10" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div
              ref={inputRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInputChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              className="w-full border-2 bg-base-bg p-4 focus:outline-none transition-all duration-150 min-h-[80px] cursor-text"
              style={{ 
                borderColor: '#E8E8E8',
                color: '#E8E8E8',
                fontSize: '16px',
                lineHeight: '1.6',
                fontFamily: 'inherit',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 240, 255, 0.8)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none'
              }}
              data-placeholder={placeholderText}
            />
            <style>{`
              [contenteditable][data-placeholder]:empty:before {
                content: attr(data-placeholder);
                color: #808080;
                pointer-events: none;
              }
            `}</style>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !inputValue.trim()}
            className="border-2 border-cyan bg-cyan bg-opacity-10 px-8 py-2.5 text-cyan hover:bg-cyan hover:text-base-bg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan disabled:hover:bg-opacity-10 disabled:hover:text-cyan"
            style={{ 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              minHeight: '44px',
              backgroundColor: 'rgba(0, 240, 255, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && inputValue.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.backgroundColor = '#00F0FF'
                e.currentTarget.style.color = '#0A0A0A'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              if (!isLoading && inputValue.trim()) {
                e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.1)'
                e.currentTarget.style.color = '#00F0FF'
              }
            }}
          >
            &gt;&gt; send
          </button>
        </div>
      </div>
    </div>
  )
}
