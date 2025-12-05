import { supabase } from './supabase'

export interface Submission {
  id?: string
  idea: string
  created_at?: string
}

export interface SystemPrompt {
  id?: string
  prompt_text: string
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

// Transform idea using AI API (AI #1: transforms user ideas into system prompts)
export async function transformIdeaToPrompt(idea: string, retries: number = 3): Promise<string> {
  console.log('[AI #1] Transforming idea to prompt:', idea.substring(0, 50) + '...')

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const result = data.prompt?.trim() || ''
      
      if (!result) {
        throw new Error('AI returned an empty response')
      }
      
      console.log('[AI #1] Transformation result:', result.substring(0, 50) + '...')
      return result
    } catch (error: any) {
      console.error(`[AI #1] Error calling API (attempt ${attempt + 1}/${retries}):`, error)
      
      // Handle rate limit with exponential backoff
      if (error?.message?.includes('429') || error?.message?.includes('rate limit')) {
        if (attempt < retries - 1) {
          const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
          console.log(`[AI #1] Rate limited. Retrying in ${delay}ms...`)
          await wait(delay)
          continue
        }
        throw new Error('Rate limit exceeded. Please try again later.')
      }
      
      // If it's the last attempt, throw the error
      if (attempt === retries - 1) {
        if (error?.message) {
          throw new Error(`AI API error: ${error.message}`)
        }
        throw new Error('Unknown error occurred while calling AI API.')
      }
    }
  }
  
  throw new Error('Failed to transform idea after multiple attempts.')
}

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

// Get all system prompts from database
export async function getSystemPrompts(): Promise<SystemPrompt[]> {
  const { data, error } = await supabase
    .from('system_prompts')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch system prompts: ${error.message}`)
  }

  return data || []
}

// Add system prompt to database (only if unique)
export async function addSystemPrompt(promptText: string): Promise<void> {
  // Check if prompt already exists
  const { data: existing } = await supabase
    .from('system_prompts')
    .select('id')
    .eq('prompt_text', promptText)
    .single()

  if (existing) {
    return // Already exists, skip
  }

  const { error } = await supabase
    .from('system_prompts')
    .insert([{ prompt_text: promptText }])

  if (error) {
    throw new Error(`Failed to add system prompt: ${error.message}`)
  }
}

// Get concatenated system prompt
export async function getConcatenatedSystemPrompt(): Promise<string> {
  const prompts = await getSystemPrompts()
  
  if (prompts.length === 0) {
    return ''
  }
  
  // Use a Set to ensure uniqueness
  const promptSet = new Set<string>()
  prompts.forEach(p => {
    if (p.prompt_text.trim()) {
      promptSet.add(p.prompt_text)
    }
  })
  
  return Array.from(promptSet).join('\n\n')
}

// Process a submission: save it, transform it, and add to system prompts
export async function processSubmission(idea: string): Promise<void> {
  try {
    // Save submission first (so it's saved even if AI fails)
    console.log('[Process] Step 1: Saving submission...')
    await saveSubmission(idea)
    console.log('[Process] Step 1: Complete')

    // Transform idea to prompt
    console.log('[Process] Step 2: Transforming idea to prompt...')
    try {
      const transformedPrompt = await transformIdeaToPrompt(idea)
      console.log('[Process] Step 2: Complete, prompt:', transformedPrompt.substring(0, 50) + '...')

      // Add to system prompts (will skip if duplicate)
      console.log('[Process] Step 3: Adding system prompt...')
      await addSystemPrompt(transformedPrompt)
      console.log('[Process] Step 3: Complete')
      console.log('[Process] All steps completed successfully')
    } catch (aiError) {
      // If AI transformation fails, still consider it a partial success since submission is saved
      console.error('[Process] AI transformation failed, but submission was saved:', aiError)
      throw aiError // Re-throw so user knows about the AI failure
    }
  } catch (error) {
    console.error('[Process] Error in processSubmission:', error)
    throw error
  }
}

