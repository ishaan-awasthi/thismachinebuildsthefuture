import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { processSubmission, getSystemPrompts } from '../lib/api'

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

const sampleTexts = [
  'i think ai should be concise and clear... it should always limit its responses to 2 sentences max.',
  'ai should be funny! it should tell jokes every now and then',
  'it should be kind and compliment the user when they\'re sad',
]

export default function LandingPage() {
  const [showTitle, setShowTitle] = useState(false)
  const [showLines, setShowLines] = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)
  const [contributions, setContributions] = useState(1247)
  const [inputValue, setInputValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [placeholderText] = useState(() => sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
  const navigate = useNavigate()

  useEffect(() => {
    const titleTimer = setTimeout(() => {
      setShowTitle(true)
    }, 1000) // Delay before title appears
    
    // After 2 seconds, start showing lines one by one
    const timer = setTimeout(() => {
      setShowLines(true)
      const lineInterval = setInterval(() => {
        setVisibleLines((prev) => {
          if (prev >= 4) {
            clearInterval(lineInterval)
            return prev
          }
          return prev + 1
        })
      }, 800) // Slower line-by-line appearance
      
      return () => clearInterval(lineInterval)
    }, 2500)

    // Load contributions count
    loadContributionsCount()

    return () => {
      clearTimeout(timer)
      clearTimeout(titleTimer)
    }
  }, [])

  const loadContributionsCount = async () => {
    try {
      const prompts = await getSystemPrompts()
      setContributions(prompts.length)
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="w-full max-w-2xl px-8 -mt-16">
        {/* Title */}
        <div className={`pb-8 text-center transition-opacity duration-1000 ${showTitle ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-4xl font-semibold text-[#0a0a0a]">
            THIS MACHINE BUILDS THE FUTURE
          </h1>
        </div>

        {/* Content area */}
        <div>
        {/* Line 1 */}
        <div className={`ml-8 mb-4 transition-opacity duration-700 ${showLines && visibleLines >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-lg text-[#1a1a1a]">but it needs your help.</p>
        </div>

        {/* Line 2 */}
        <div className={`ml-8 mb-4 transition-opacity duration-700 ${showLines && visibleLines >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-lg text-[#1a1a1a]">artificial intelligence is here to stay, and we're already using it to build the present. but how should we use it to build the future?</p>
        </div>

        {/* Line 3 */}
        <div className={`ml-8 mb-4 transition-opacity duration-700 ${showLines && visibleLines >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-lg text-[#1a1a1a]">how do you think ai ought to behave?</p>
        </div>

        {/* Chatbox */}
        <div className={`flex justify-center mb-1 transition-opacity duration-500 ${showLines && visibleLines >= 4 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="relative" style={{ width: 'calc(100% - 4rem)' }}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-3 pr-12 border border-[#1a1a1a] rounded bg-[#fafafa] resize-none focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] placeholder:text-[#b5b5b5]"
              style={{ color: inputValue ? '#0a0a0a' : '#b5b5b5' }}
              rows={2}
              placeholder={placeholderText}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !inputValue.trim()}
              className="group absolute bottom-2 right-1 h-8 w-8 flex items-center justify-center rounded text-[#b5b5b5] hover:text-[#222222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Submit response"
            >
              <CornerDownRightIcon />
            </button>
          </div>
        </div>

        {/* Contributions counter */}
        <div className={`ml-8 transition-opacity duration-500 ${showLines && visibleLines >= 4 ? 'opacity-100' : 'opacity-0'}`}>
          <Link
            to="/timeline"
            className="text-xs italic underline text-[#888888] hover:text-[#444444] transition-colors"
          >
            {contributions.toLocaleString()} contributions
          </Link>
        </div>
        </div>
      </div>
    </div>
  )
}
