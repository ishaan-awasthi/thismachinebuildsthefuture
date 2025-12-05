import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { processSubmission, getAllSubmissions } from '../lib/api'

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
    // Letter-by-letter typing animation for title
    let currentChar = 0
    let cursorInterval: number | null = null
    
    // Cursor blink animation
    cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev)
    }, 530)
    
    const typingInterval = setInterval(() => {
      if (currentChar < fullTitle.length) {
        setTypedTitle(fullTitle.substring(0, currentChar + 1))
        currentChar++
      } else {
        clearInterval(typingInterval)
        // Stop cursor blinking and hide after delay
        if (cursorInterval) {
          clearInterval(cursorInterval)
        }
        setTimeout(() => {
          setCursorVisible(false)
          // Start typing subtitle
          startTypingSubtitle()
        }, 2000)
      }
    }, 30)
    
    return () => {
      clearInterval(typingInterval)
      if (cursorInterval) {
        clearInterval(cursorInterval)
      }
    }

  }, [])

  // Load contributions count on mount
  useEffect(() => {
    const loadContributions = async () => {
      try {
        const submissions = await getAllSubmissions()
        setTargetContributions(submissions.length)
      } catch (error) {
        console.error('Error loading contributions:', error)
      }
    }
    loadContributions()
  }, [])

  // Animate contributions counter (slower)
  useEffect(() => {
    if (targetContributions === 0) {
      setDisplayContributions(0)
      return
    }
    
    if (displayContributions === targetContributions) return

    const duration = 3000 // 3 seconds - slower
    const startValue = displayContributions
    const endValue = targetContributions
    const difference = endValue - startValue
    
    if (difference === 0) return

    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.round(startValue + difference * easeOutCubic)
      
      setDisplayContributions(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayContributions(endValue)
      }
    }

    requestAnimationFrame(animate)
  }, [targetContributions])


  const startTypingSubtitle = () => {
    let currentChar = 0
    const subtitleInterval = setInterval(() => {
      if (currentChar < subtitleText.length) {
        setTypedSubtitle(subtitleText.substring(0, currentChar + 1))
        currentChar++
      } else {
        clearInterval(subtitleInterval)
        // Start typing question lines one by one
        setTimeout(() => startTypingQuestionLines(), 500)
      }
    }, 15)
  }

  const startTypingQuestionLines = () => {
    let currentLine = 0
    let currentChar = 0
    
    const typeLine = () => {
      const line = questionLines[currentLine]
      if (currentChar < line.length) {
        setTypedQuestionLines(prev => {
          const newLines = [...prev]
          newLines[currentLine] = line.substring(0, currentChar + 1)
          return newLines
        })
        currentChar++
        setTimeout(typeLine, 10)
      } else {
        // Finished current line
        currentLine++
        if (currentLine < questionLines.length) {
          // Start next line
          currentChar = 0
          setTimeout(typeLine, 100)
        } else {
          // All lines done, show input
          setTimeout(() => {
            setShowInput(true)
            // Focus the input
            setTimeout(() => inputRef.current?.focus(), 100)
          }, 200)
        }
      }
    }
    
    typeLine()
  }

  const loadContributionsCount = async () => {
    try {
      const submissions = await getAllSubmissions()
      const newCount = submissions.length
      setTargetContributions(newCount)
    } catch (error) {
      console.error('Error loading contributions:', error)
    }
  }

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      console.log('[Submit] Starting submission process...')
      await processSubmission(inputValue.trim())
      console.log('[Submit] Submission successful')
      setInputValue('')
      await loadContributionsCount()
      // Navigate to chat page after submission
      navigate('/chat')
    } catch (error) {
      console.error('Error submitting idea:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Submit] Full error:', errorMessage)
      alert(`Failed to submit idea: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
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
    // Allow normal text input and Enter for new lines
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

  return (
    <>
      <style>{`
        @keyframes fastFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div className="h-screen bg-base-bg flex flex-col overflow-hidden">
      {/* Main content - centered vertically, reserve space to prevent shifting */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 md:px-10 py-10">
        <div className="w-full max-w-4xl">
          {/* Title - single line, smaller, reserve height */}
          <div className="text-center mb-8" style={{ minHeight: '80px' }}>
            <h1 
              className="text-headline text-2xl md:text-3xl lg:text-4xl text-base-text whitespace-nowrap"
              style={{ letterSpacing: '0.05em' }}
            >
              {typedTitle}
              {cursorVisible && typedTitle.length <= fullTitle.length && (
                <span style={{ color: '#00F0FF' }}>|</span>
              )}
            </h1>
            
            {/* Cyan line underneath - fade in */}
            <div className="mt-4 mx-auto transition-opacity duration-500" style={{ width: '80%', height: '2px', background: typedTitle === fullTitle ? '#00F0FF' : 'transparent' }} />
          </div>

          {/* Subtitle - left aligned with chevron, reserve space */}
          <div className="mb-6" style={{ minHeight: '30px' }}>
            {typedSubtitle && (
              <p className="text-base-text flex items-start gap-2 animate-fade-in" style={{ fontSize: '16px' }}>
                <span className="text-cyan">&gt;&gt;</span>
                <span>{typedSubtitle}</span>
              </p>
            )}
          </div>

          {/* Question section - left aligned with chevrons, reserve space */}
          <div className="mb-8" style={{ minHeight: '120px' }}>
            {typedQuestionLines.some(line => line.length > 0) && (
              <div className="text-base-text lowercase flex flex-col gap-2 animate-slide-up" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {typedQuestionLines.map((line, index) => {
                  if (line.length === 0) return null
                  
                  // Handle AI highlighting in the last line
                  if (index === 2) {
                    const aiIndex = line.toLowerCase().indexOf('ai')
                    if (aiIndex !== -1) {
                      const before = line.substring(0, aiIndex)
                      const ai = line.substring(aiIndex, aiIndex + 2)
                      const after = line.substring(aiIndex + 2)
                      return (
                        <span key={index} className="flex items-start gap-2">
                          <span className="text-cyan">&gt;&gt;</span>
                          <span>
                            {before}
                            <span className="text-base-text uppercase">{ai}</span>
                            {after}
                          </span>
                        </span>
                      )
                    }
                  }
                  
                  return (
                    <span key={index} className="flex items-start gap-2">
                      <span className="text-cyan">&gt;&gt;</span>
                      <span>{line}</span>
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Input section - reserve space */}
          <div style={{ minHeight: '180px' }}>
            {showInput && (
              <div style={{ 
                animation: 'fastFadeIn 0.15s ease-in'
              }}>
                {/* Custom styled input */}
                <div className="relative mb-4">
                  <div
                    ref={inputRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    className="w-full border-2 bg-base-bg p-4 focus:outline-none transition-all duration-150 min-h-[100px] cursor-text"
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

                {/* Submit button with blue accent */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !inputValue.trim()}
                  className="border-2 border-cyan bg-cyan bg-opacity-10 px-8 py-2.5 text-cyan hover:bg-cyan hover:text-base-bg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan disabled:hover:bg-opacity-10 disabled:hover:text-cyan"
                  style={{ 
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    minHeight: '44px',
                    backgroundColor: 'rgba(0, 240, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting && inputValue.trim()) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.backgroundColor = '#00F0FF'
                      e.currentTarget.style.color = '#0A0A0A'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    if (!isSubmitting && inputValue.trim()) {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.1)'
                      e.currentTarget.style.color = '#00F0FF'
                    }
                  }}
                >
                  {isSubmitting ? '>> processing...' : '>> submit and continue'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom left - manifesto link */}
      <div className="absolute bottom-5 left-5 md:left-10">
        <Link
          to="/manifesto"
          className="text-primary-text hover:text-cyan transition-colors duration-200"
          style={{ 
            fontSize: '18px',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderBottom = '1px solid #00F0FF'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderBottom = 'none'
          }}
        >
          &gt;&gt; tmbtf manifesto
        </Link>
      </div>

      {/* Bottom right - contributions counter */}
      <div className="absolute bottom-5 right-5 md:right-10">
        <Link
          to="/timeline"
          className="text-primary-text hover:text-cyan transition-colors duration-200"
          style={{ 
            fontSize: '18px',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderBottom = '1px solid #00F0FF'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderBottom = 'none'
          }}
        >
          &gt;&gt; {displayContributions.toLocaleString()} contributions & counting
        </Link>
      </div>
    </div>
    </>
  )
}
