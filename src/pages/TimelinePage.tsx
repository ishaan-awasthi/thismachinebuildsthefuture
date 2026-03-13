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
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  useEffect(() => { loadSubmissions() }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = parseInt(e.target.getAttribute('data-index') || '0')
          setVisibleIndices(prev => new Set([...prev, idx]))
        }
      }),
      { threshold: 0.1 }
    )
    const els = document.querySelectorAll('[data-contribution]')
    els.forEach(el => observer.observe(el))
    return () => els.forEach(el => observer.unobserve(el))
  }, [submissions])

  const loadSubmissions = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('submissions').select('*').order('created_at', { ascending: true })
      if (error) { console.error(error); return }
      setSubmissions(data || [])
      if (data?.length) data.forEach((_, i) => setTimeout(() => setVisibleIndices(p => new Set([...p, i])), i * 100))
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const getRot = (i: number) => ((i * 7) % 3) - 1

  return (
    <div style={{ minHeight: '100vh', background: '#0D0B09', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10,
        background: '#0D0B09', borderBottom: '1px solid #2A2018',
      }}>
        <div style={{ height: '4px', background: '#D42B1E' }} />
        <div className="header-inner" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px clamp(1.5rem, 6vw, 5rem)',
        }}>
          <h1 className="header-title" style={{
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

      {/* ── TIMELINE ── */}
      <div style={{ flex: 1, paddingTop: '96px' }} ref={timelineRef}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <p style={{ color: '#7A7470', fontSize: '14px', letterSpacing: '0.04em' }}>loading timeline...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <p style={{ color: '#7A7470', fontSize: '14px', letterSpacing: '0.04em' }}>no submissions yet.</p>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', padding: '40px 0 80px' }}>

            {/* Spine */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              left: isMobile ? '40px' : '50%',
              transform: isMobile ? 'none' : 'translateX(-50%)',
              width: '3px', background: '#D42B1E',
            }} />

            {submissions.map((sub, i) => {
              const isLeft = isMobile ? true : i % 2 === 0
              const isVisible = visibleIndices.has(i)
              const rot = getRot(i)

              return (
                <div
                  key={sub.id || i}
                  data-contribution
                  data-index={i}
                  style={{
                    position: 'relative', marginBottom: '64px',
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.3s ease-in, transform 0.3s ease-out',
                    transform: isVisible
                      ? `translateX(0) rotate(${rot}deg)`
                      : `translateX(${isLeft ? '-20px' : '20px'}) rotate(${rot}deg)`,
                  }}
                >
                  {/* Dot */}
                  <div style={{
                    position: 'absolute',
                    left: isMobile ? '33px' : '50%',
                    top: '20px',
                    transform: isMobile ? 'none' : 'translateX(-50%)',
                    width: '10px', height: '10px',
                    background: '#D42B1E', borderRadius: '50%',
                  }} />

                  {/* Card */}
                  <div
                    style={{
                      marginLeft: isLeft ? '60px' : 'auto',
                      marginRight: isLeft ? 'auto' : '60px',
                      maxWidth: '360px',
                      border: '1px solid #2A2018',
                      padding: '16px 18px',
                      background: 'transparent',
                      transform: `rotate(${rot}deg)`,
                      transition: 'border-color 0.15s',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#D42B1E'
                      const p = e.currentTarget.querySelector('p')
                      if (p) p.style.color = '#D42B1E'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#2A2018'
                      const p = e.currentTarget.querySelector('p')
                      if (p) p.style.color = '#F0EBE3'
                    }}
                  >
                    <div style={{ color: '#7A7470', fontSize: '11px', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      {sub.created_at ? formatDate(sub.created_at) : 'Unknown date'}
                    </div>
                    <p style={{ color: '#F0EBE3', fontSize: '15px', lineHeight: '1.6', margin: 0, transition: 'color 0.15s' }}>
                      {sub.idea}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
