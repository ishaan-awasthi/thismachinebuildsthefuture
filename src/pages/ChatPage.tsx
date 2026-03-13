import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getConcatenatedSystemPrompt } from '../lib/api'

const chatSampleTexts = [
  'hi! my name is george washington.',
  'what is boba made of?',
  'i had a bad day and want to talk about it',
  'my favorite color is green',
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

  useEffect(() => { loadSystemPrompt() }, [])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => {
    let iv: number | undefined
    if (isLoading) iv = setInterval(() => setEllipsisCount(p => (p + 1) % 4), 500)
    return () => { if (iv) clearInterval(iv) }
  }, [isLoading])

  const loadSystemPrompt = async () => {
    try { setSystemPrompt((await getConcatenatedSystemPrompt()) || '') }
    catch (e) { console.error(e); setSystemPrompt('') }
  }

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return
    const msg = inputValue.trim()
    setInputValue('')
    if (inputRef.current) inputRef.current.textContent = ''
    setMessages(p => [...p, { role: 'user', content: msg }])
    setIsLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, systemPrompt: systemPrompt || '' }),
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `HTTP ${res.status}`) }
      const data = await res.json()
      setMessages(p => [...p, { role: 'assistant', content: data.response?.trim() || 'Sorry, no response.' }])
    } catch (error: any) {
      let em = 'Sorry, I encountered an error.'
      if (error?.status === 429) em = 'Rate limit exceeded. Please wait.'
      else if (error?.status === 401) em = 'Invalid API key.'
      else if (error?.message) em = error.message
      setMessages(p => [...p, { role: 'assistant', content: em }])
    } finally { setIsLoading(false) }
  }

  const handleInputChange = (e: React.FormEvent<HTMLDivElement>) => setInputValue(e.currentTarget.textContent || '')
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSubmit() }
  }
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0); r.deleteContents(); r.insertNode(document.createTextNode(text))
      r.collapse(false); sel.removeAllRanges(); sel.addRange(r)
    }
    setInputValue(e.currentTarget.textContent || '')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0B09', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        [contenteditable][data-placeholder]:empty:before { content: attr(data-placeholder); color: #7A7470; pointer-events: none; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10,
        background: '#0D0B09', borderBottom: '1px solid #2A2018',
      }}>
        <div style={{ height: '4px', background: '#D42B1E' }} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px clamp(1.5rem, 6vw, 5rem)',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)',
            letterSpacing: '0.04em', color: '#F0EBE3', lineHeight: 1,
            textTransform: 'uppercase', margin: 0,
          }}>
            THIS MACHINE BUILDS THE FUTURE
          </h1>
          <Link to="/"
            style={{ color: '#7A7470', textDecoration: 'none', fontSize: '13px', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: '24px', transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F0EBE3'; e.currentTarget.style.borderBottom = '1px solid #D42B1E' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#7A7470'; e.currentTarget.style.borderBottom = 'none' }}
          >&gt;&gt; return home</Link>
        </div>
      </header>

      {/* ── MESSAGES ── */}
      <div
        ref={messagesContainerRef}
        style={{ flex: 1, overflowY: 'auto', paddingTop: '100px', paddingBottom: '160px' }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 clamp(1.5rem, 6vw, 5rem)' }}>
          {messages.length === 0 ? (
            <p style={{ color: '#7A7470', fontSize: '14px', letterSpacing: '0.02em', margin: 0 }}>
              &gt;&gt; start a conversation below...
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '72%', paddingLeft: '14px',
                    borderLeft: `3px solid ${msg.role === 'user' ? '#D42B1E' : '#2A2018'}`,
                  }}>
                    <span style={{ marginRight: '8px', color: msg.role === 'user' ? '#D42B1E' : '#7A7470', fontWeight: 600 }}>&gt;&gt;</span>
                    <span style={{ color: '#F0EBE3', fontSize: '16px', lineHeight: '1.6' }}>{msg.content}</span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ maxWidth: '72%', paddingLeft: '14px', borderLeft: '3px solid #2A2018' }}>
                    <span style={{ marginRight: '8px', color: '#7A7470' }}>&gt;&gt;</span>
                    <span style={{ color: '#7A7470', fontSize: '16px' }}>{''.padEnd(ellipsisCount, '.')}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* ── INPUT BAR ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
        background: '#0D0B09', borderTop: '1px solid #2A2018',
        padding: '16px clamp(1.5rem, 6vw, 5rem)',
      }}>
        <div style={{ display: 'flex', gap: '12px', maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ flex: 1 }}>
            <div
              ref={inputRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInputChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              style={{
                width: '100%', border: '2px solid #7A7470', background: 'transparent',
                padding: '12px 14px', color: '#F0EBE3', fontSize: '16px', lineHeight: '1.6',
                fontFamily: 'var(--font-mono)', minHeight: '76px', outline: 'none',
                whiteSpace: 'pre-wrap', wordWrap: 'break-word',
                transition: 'border-color 0.12s, box-shadow 0.12s', boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#D42B1E'; e.currentTarget.style.boxShadow = 'inset 0 0 0 1px #D42B1E' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#7A7470'; e.currentTarget.style.boxShadow = 'none' }}
              data-placeholder={placeholderText}
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !inputValue.trim()}
            style={{
              border: '2px solid #D42B1E', background: 'transparent', color: '#D42B1E',
              padding: '0 28px', fontFamily: 'var(--font-display)',
              fontSize: '1.5rem', letterSpacing: '0.06em',
              cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !inputValue.trim() ? 0.4 : 1,
              transition: 'background 0.15s, color 0.15s',
              alignSelf: 'stretch', flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (!isLoading && inputValue.trim()) {
                e.currentTarget.style.background = '#D42B1E'
                e.currentTarget.style.color = '#F0EBE3'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#D42B1E'
            }}
          >
            SEND &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  )
}
