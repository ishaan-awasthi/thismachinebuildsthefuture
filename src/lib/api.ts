import { supabase } from './supabase'

export interface Submission {
  id?: string
  idea: string
  created_at?: string
}

// Save user submission to database
export async function saveSubmission(idea: string): Promise<Submission> {
  console.log('[Supabase] Saving submission to database...')
  console.log('[Supabase] Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'NOT SET')
  console.log('[Supabase] Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'NOT SET')
  
  const { data, error } = await supabase
    .from('submissions')
    .insert([{ idea }])
    .select()
    .single()

  if (error) {
    console.error('[Supabase] Error saving submission:', error)
    throw new Error(`Failed to save submission: ${error.message}`)
  }

  console.log('[Supabase] Submission saved successfully:', data.id)
  return data
}

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Get all submissions from database
export async function getAllSubmissions(): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch submissions: ${error.message}`)
  }

  return data || []
}

// Generate combined system prompt from all submissions (via API call)
export async function generateCombinedSystemPrompt(submissions: Submission[], retries: number = 3): Promise<string> {
  console.log('[AI] Generating combined system prompt from submissions...')

  const ideas = submissions.map((s) => s.idea).filter(Boolean)

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch('/api/combine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ideas }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const result = data.combinedPrompt?.trim() || ''
      if (!result) {
        throw new Error('AI returned an empty response')
      }
      console.log('[AI] Combined prompt generated.')
      return result
    } catch (error: any) {
      console.error(`[AI] Error generating combined prompt (attempt ${attempt + 1}/${retries}):`, error)

      // Handle rate limit with exponential backoff
      if (error?.message?.includes('429') || error?.message?.includes('rate limit')) {
        if (attempt < retries - 1) {
          const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
          console.log(`[AI] Rate limited. Retrying in ${delay}ms...`)
          await wait(delay)
          continue
        }
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      if (attempt === retries - 1) {
        if (error?.message) {
          throw new Error(`AI API error: ${error.message}`)
        }
        throw new Error('Unknown error occurred while generating combined prompt.')
      }
    }
  }

  throw new Error('Failed to generate combined prompt after multiple attempts.')
}

// Process a submission: pull all submissions, add new idea, generate prompt, then save
export async function processSubmission(idea: string): Promise<void> {
  try {
    console.log('[Process] Step 1: Pulling all existing submissions...')
    const existingSubmissions = await getAllSubmissions()
    console.log('[Process] Found', existingSubmissions.length, 'existing submissions')
    
    console.log('[Process] Step 2: Generating combined prompt with all submissions + new idea...')
    // Create a temporary submission list that includes the new idea
    const allIdeas = [...existingSubmissions.map(s => s.idea), idea]
    const tempSubmissions = allIdeas.map((ideaText, index) => ({
      id: `temp-${index}`,
      idea: ideaText,
      created_at: new Date().toISOString()
    }))
    
    // Generate the combined prompt (this includes the new idea)
    await generateCombinedSystemPrompt(tempSubmissions)
    console.log('[Process] Combined prompt generated (includes new idea)')
    
    console.log('[Process] Step 3: Saving new submission to Supabase...')
    await saveSubmission(idea)
    console.log('[Process] Submission saved successfully')
  } catch (error) {
    console.error('[Process] Error in processSubmission:', error)
    throw error
  }
}

