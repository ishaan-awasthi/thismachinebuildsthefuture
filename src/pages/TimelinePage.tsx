import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Submission {
  id?: string
  idea: string
  created_at?: string
}

export default function TimelinePage() {
  const [showTitle, setShowTitle] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Title fades in
    const titleTimer = setTimeout(() => {
      setShowTitle(true)
    }, 1000)

    // Timeline fades in after title
    const timelineTimer = setTimeout(() => {
      setShowTimeline(true)
      loadSubmissions()
    }, 2000)

    return () => {
      clearTimeout(titleTimer)
      clearTimeout(timelineTimer)
    }
  }, [])

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

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl px-8 -mt-16">
        {/* Title */}
        <div className={`pb-8 text-center transition-opacity duration-1000 ${showTitle ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-4xl font-semibold text-[#0a0a0a]">
            THIS MACHINE BUILDS THE FUTURE
          </h1>
        </div>

        {/* Timeline */}
        <div className={`transition-opacity duration-700 ${showTimeline ? 'opacity-100' : 'opacity-0'}`}>
          {isLoading ? (
            <div className="text-center text-[#888888]">
              <p>Loading timeline...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center text-[#888888]">
              <p>No submissions yet.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#1a1a1a]"></div>

              {/* Timeline items */}
              <div className="space-y-8">
                {submissions.map((submission, index) => (
                  <div key={submission.id || index} className="relative pl-16">
                    {/* Timeline dot */}
                    <div className="absolute left-6 w-4 h-4 rounded-full bg-[#1a1a1a] border-2 border-[#fafafa]"></div>

                    {/* Content */}
                    <div className="pb-4">
                      <div className="text-xs text-[#888888] mb-2">
                        {submission.created_at ? formatDate(submission.created_at) : 'Unknown date'}
                      </div>
                      <p className="text-[#1a1a1a] leading-relaxed">
                        {submission.idea}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
