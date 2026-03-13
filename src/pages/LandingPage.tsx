import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { processSubmission, getSystemPrompts } from '../lib/api'

const fullTitle = 'THIS MACHINE BUILDS THE FUTURE'
const subtitleText = "but it needs your help."
const questionLines = [
  "artificial intelligence is here to stay, and we're already using it to build the present.",
  "but how should we use it to build the future?",
  "how do you think ai ought to behave?"
]

const sampleTexts = [
  'i think ai should be concise and clear... it should always limit its responses to 2 sentences max.',
  'ai should be funny! it should tell jokes every now and then',
  'it should be kind and compliment the user when they\'re sad',
]

export default function LandingPage() {
  const [typedTitle, setTypedTitle] = useState('')
  const [typedSubtitle, setTypedSubtitle] = useState('')
  const [typedQuestionLines, setTypedQuestionLines] = useState<string[]>(['', '', ''])
  const [showInput, setShowInput] = useState(false)
  const [displayContributions, setDisplayContributions] = useState(0)
  const [targetContributions, setTargetContributions] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)
  const [placeholderText] = useState(() => sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
  const navigate = useNavigate()
  const inputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let currentChar = 0
    let cursorInterval: number | null = null

    cursorInterval = setInterval(() => setCursorVisible(prev => !prev), 530)

    const typingInterval = setInterval(() => {
      if (currentChar < fullTitle.length) {
        setTypedTitle(fullTitle.substring(0, currentChar + 1))
        currentChar++
      } else {
        clearInterval(typingInterval)
        if (cursorInterval) clearInterval(cursorInterval)
        setTimeout(() => {
          setCursorVisible(false)
          startTypingSubtitle()
        }, 2000)
      }
    }, 30)

    return () => {
      clearInterval(typingInterval)
      if (cursorInterval) clearInterval(cursorInterval)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const prompts = await getSystemPrompts()
        setTargetContributions(prompts.length)
      } catch (e) { console.error(e) }
    }
    load()
  }, [])

  useEffect(() => {
    if (targetContributions === 0) { setDisplayContributions(0); return }
    if (displayContributions === targetContributions) return
    const duration = 3000
    const start = displayContributions
    const end = targetContributions
    const diff = end - start
    if (diff === 0) return
    const t0 = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - t0) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplayContributions(Math.round(start + diff * ease))
      if (p < 1) requestAnimationFrame(tick)
      else setDisplayContributions(end)
    }
    requestAnimationFrame(tick)
  }, [targetContributions])

  const startTypingSubtitle = () => {
    let i = 0
    const iv = setInterval(() => {
      if (i < subtitleText.length) setTypedSubtitle(subtitleText.substring(0, ++i))
      else { clearInterval(iv); setTimeout(() => startTypingQuestionLines(), 500) }
    }, 15)
  }

  const startTypingQuestionLines = () => {
    let line = 0, char = 0
    const tick = () => {
      const l = questionLines[line]
      if (char < l.length) {
        setTypedQuestionLines(prev => { const n = [...prev]; n[line] = l.substring(0, ++char); return n })
        setTimeout(tick, 10)
      } else {
        line++
        if (line < questionLines.length) { char = 0; setTimeout(tick, 100) }
        else setTimeout(() => { setShowInput(true); setTimeout(() => inputRef.current?.focus(), 100) }, 200)
      }
    }
    tick()
  }

  const reloadCount = async () => {
    try { const p = await getSystemPrompts(); setTargetContributions(p.length) }
    catch (e) { console.error(e) }
  }

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await processSubmission(inputValue.trim())
      setInputValue('')
      await reloadCount()
      navigate('/chat')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to submit: ${msg}`)
    } finally { setIsSubmitting(false) }
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
    <>
      <style>{`
        @keyframes fastFadeIn { from { opacity: 0; } to { opacity: 1; } }
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #7A7470;
          pointer-events: none;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0D0B09', display: 'flex', flexDirection: 'column' }}>

        {/* ── 6px red top stripe ── */}
        <div style={{ height: '6px', background: '#D42B1E', flexShrink: 0 }} />

        {/* ── Main content ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 6vw, 5rem)',
        }}>

          {/* TITLE */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 className="landing-title" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 7vw, 6rem)',
              lineHeight: 0.88,
              letterSpacing: '0.02em',
              color: '#F0EBE3',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              {typedTitle}
              {cursorVisible && typedTitle.length <= fullTitle.length && (
                <span style={{ color: '#D42B1E' }}>|</span>
              )}
            </h1>

            {/* Red rule slides in when title finishes */}
            <div style={{
              marginTop: '1.5rem',
              height: '4px',
              background: '#D42B1E',
              width: typedTitle === fullTitle ? '100%' : '0',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>

          {/* SUBTITLE */}
          <div style={{ minHeight: '30px', marginBottom: '1.25rem' }}>
            {typedSubtitle && (
              <p style={{
                fontSize: '17px', color: '#F0EBE3',
                display: 'flex', alignItems: 'center', gap: '10px',
                animation: 'fastFadeIn 0.2s ease-in', margin: 0, letterSpacing: '0.01em',
              }}>
                <span style={{ color: '#D42B1E', fontWeight: 600 }}>&gt;&gt;</span>
                {typedSubtitle}
              </p>
            )}
          </div>

          {/* QUESTION LINES */}
          <div style={{ minHeight: '115px', marginBottom: '2.5rem' }}>
            {typedQuestionLines.some(l => l.length > 0) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {typedQuestionLines.map((line, idx) => {
                  if (!line) return null
                  if (idx === 2) {
                    const ai = line.toLowerCase().indexOf('ai')
                    if (ai !== -1) return (
                      <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '16px', color: '#F0EBE3', lineHeight: '1.6' }}>
                        <span style={{ color: '#D42B1E', fontWeight: 600, flexShrink: 0 }}>&gt;&gt;</span>
                        <span>
                          {line.substring(0, ai)}
                          <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{line.substring(ai, ai + 2)}</span>
                          {line.substring(ai + 2)}
                        </span>
                      </div>
                    )
                  }
                  return (
                    <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '16px', color: '#F0EBE3', lineHeight: '1.6' }}>
                      <span style={{ color: '#D42B1E', fontWeight: 600, flexShrink: 0 }}>&gt;&gt;</span>
                      <span>{line}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* INPUT */}
          <div style={{ minHeight: '160px' }}>
            {showInput && (
              <div style={{ animation: 'fastFadeIn 0.15s ease-in', maxWidth: '660px' }}>
                <div
                  ref={inputRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  style={{
                    width: '100%', border: '2px solid #7A7470', background: 'transparent',
                    padding: '14px 16px', color: '#F0EBE3', fontSize: '16px', lineHeight: '1.6',
                    fontFamily: 'var(--font-mono)', minHeight: '100px', outline: 'none',
                    whiteSpace: 'pre-wrap', wordWrap: 'break-word', marginBottom: '14px',
                    transition: 'border-color 0.12s, box-shadow 0.12s', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#D42B1E'; e.currentTarget.style.boxShadow = 'inset 0 0 0 1px #D42B1E' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#7A7470'; e.currentTarget.style.boxShadow = 'none' }}
                  data-placeholder={placeholderText}
                />
                <button
                  type="button"
                  className="submit-btn-mobile"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !inputValue.trim()}
                  style={{
                    border: '2px solid #D42B1E', background: 'transparent', color: '#D42B1E',
                    padding: '10px 30px', fontFamily: 'var(--font-display)',
                    fontSize: '1.55rem', letterSpacing: '0.06em',
                    cursor: isSubmitting || !inputValue.trim() ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting || !inputValue.trim() ? 0.4 : 1,
                    transition: 'background 0.15s, color 0.15s, transform 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!isSubmitting && inputValue.trim()) {
                      e.currentTarget.style.background = '#D42B1E'
                      e.currentTarget.style.color = '#F0EBE3'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#D42B1E'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  {isSubmitting ? 'PROCESSING...' : 'SUBMIT AND CONTINUE >>'}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ── Footer bar ── */}
        <div className="landing-footer" style={{
          borderTop: '1px solid #2A2018',
          padding: '16px clamp(1.5rem, 6vw, 5rem)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
          gap: '16px',
        }}>
          <Link to="/manifesto"
            style={{ color: '#F0EBE3', textDecoration: 'none', fontSize: '15px', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)', borderBottom: '2px solid #D42B1E', paddingBottom: '2px', transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#D42B1E' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#F0EBE3' }}
          >&gt;&gt; read the manifesto</Link>
          <Link to="/timeline"
            style={{ color: '#F0EBE3', textDecoration: 'none', fontSize: '15px', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)', borderBottom: '2px solid #D42B1E', paddingBottom: '2px', transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#D42B1E' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#F0EBE3' }}
          >&gt;&gt; {displayContributions.toLocaleString()} contributions & counting</Link>
        </div>

      </div>
    </>
  )
}
