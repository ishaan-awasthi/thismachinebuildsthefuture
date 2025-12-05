import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Submission {
  id?: string
  idea: string
  created_at?: string
}

export default function TimelinePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set())
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    loadSubmissions()
  }, [])

  useEffect(() => {
    // Intersection Observer for fade-in on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisibleIndices((prev) => new Set([...prev, index]))
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('[data-contribution]')
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [submissions])

  const loadSubmissions = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading submissions:', error)
        return
      }

      setSubmissions(data || [])
      
      // Stagger animation - reveal items one by one
      if (data && data.length > 0) {
        data.forEach((_, index) => {
          setTimeout(() => {
            setVisibleIndices((prev) => new Set([...prev, index]))
          }, index * 100)
        })
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRandomRotation = (index: number) => {
    // Use index as seed for consistent rotation per item
    const seed = index * 7
    return ((seed % 3) - 1) // Returns -1, 0, or 1
  }

  return (
    <div className="min-h-screen bg-base-bg flex flex-col overflow-x-hidden">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-5 md:px-10 z-10 border-b border-border" style={{ backgroundColor: '#0A0A0A' }}>
        <h1 className="text-headline text-2xl md:text-3xl text-base-text">
          THIS MACHINE BUILDS THE FUTURE
        </h1>
        <Link
          to="/"
          className="text-primary-text hover:text-cyan hover:underline transition-all duration-200 text-sm md:text-base"
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

      {/* Timeline container - full width */}
      <div className="flex-1 pt-20 w-full" ref={timelineRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <p className="text-secondary-text">loading timeline...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex items-center justify-center h-screen">
            <p className="text-secondary-text">no submissions yet.</p>
          </div>
        ) : (
          <div className="relative w-full py-10 pb-20">
            {/* Vertical cyan timeline line - centered on desktop, 40px from left on mobile */}
            <div 
              className="absolute top-0 bottom-0 left-[40px] md:left-1/2 md:-translate-x-1/2"
              style={{
                width: '2px',
                background: '#00F0FF',
              }}
            />

            {/* Timeline items */}
            <div>
              {submissions.map((submission, index) => {
                // On mobile, all items on left. On desktop, alternate left/right
                const isLeft = isMobile ? true : index % 2 === 0
                const isVisible = visibleIndices.has(index)
                const rotation = getRandomRotation(index)
                
                return (
                  <div
                    key={submission.id || index}
                    data-contribution
                    data-index={index}
                    className="relative mb-16"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transition: 'opacity 0.3s ease-in',
                      transform: isVisible 
                        ? `translateX(0) rotate(${rotation}deg)` 
                        : `translateX(${isLeft ? '-20px' : '20px'}) rotate(${rotation}deg)`,
                    }}
                  >
                    {/* Cyan dot connecting to timeline - hidden */}
                    <div
                      className="absolute rounded-full bg-cyan transition-all duration-200 md:left-1/2 md:-translate-x-1/2"
                      style={{
                        display: 'none',
                        left: '32px',
                        top: '20px',
                        width: '8px',
                        height: '8px',
                      }}
                    />

                    {/* Contribution box */}
                    <div
                      className="border border-secondary-text p-5 max-w-[400px] transition-all duration-200 hover:border-cyan group"
                      style={{
                        marginLeft: isLeft ? '60px' : 'auto',
                        marginRight: isLeft ? 'auto' : '60px',
                        background: 'transparent',
                        transform: `rotate(${rotation}deg)`,
                      }}
                      onMouseEnter={(e) => {
                        const dot = e.currentTarget.previousElementSibling as HTMLElement
                        if (dot) {
                          dot.style.width = '12px'
                          dot.style.height = '12px'
                          dot.style.left = '30px'
                          dot.style.top = '18px'
                        }
                        e.currentTarget.style.borderColor = '#00F0FF'
                        const text = e.currentTarget.querySelector('p')
                        if (text) text.style.color = '#00F0FF'
                      }}
                      onMouseLeave={(e) => {
                        const dot = e.currentTarget.previousElementSibling as HTMLElement
                        if (dot) {
                          dot.style.width = '8px'
                          dot.style.height = '8px'
                          dot.style.left = '32px'
                          dot.style.top = '20px'
                        }
                        e.currentTarget.style.borderColor = '#808080'
                        const text = e.currentTarget.querySelector('p')
                        if (text) text.style.color = '#E8E8E8'
                      }}
                    >
                      {/* Timestamp */}
                      <div className="text-secondary-text mb-2" style={{ fontSize: '12px' }}>
                        {submission.created_at ? formatDate(submission.created_at) : 'Unknown date'}
                      </div>
                      
                      {/* Contribution text */}
                      <p 
                        className="text-base-text transition-colors duration-200"
                        style={{ 
                          fontSize: '16px',
                          lineHeight: '1.6',
                          color: '#E8E8E8'
                        }}
                      >
                        {submission.idea}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
