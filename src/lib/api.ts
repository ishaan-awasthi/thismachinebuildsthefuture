import { supabase } from './supabase'
import OpenAI from 'openai'

// Initialize OpenAI client
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || ''
const openai = new OpenAI({
  apiKey: AI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for browser usage
})

// Debug: Log if API key is loaded (only first few chars for security)
if (typeof window !== 'undefined') {
  console.log('[API Config] API Key loaded:', AI_API_KEY ? `${AI_API_KEY.substring(0, 7)}...` : 'NOT FOUND')
  console.log('[API Config] All env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')))
}

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
  if (!AI_API_KEY) {
    console.error('VITE_AI_API_KEY is not set in environment variables')
    throw new Error('API key not configured. Please set VITE_AI_API_KEY in your .env file.')
  }

  console.log('[AI #1] Transforming idea to prompt:', idea.substring(0, 50) + '...')
  console.log('[AI #1] API Key present:', !!AI_API_KEY)

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await openai.responses.create({
        model: 'gpt-5-nano-2025-08-07',
        reasoning: { effort: 'low' },
        instructions: 'Transform this idea into a string of text that can be used to prompt the behavior of an LLM. Assume it will be added to already existing list of a similar style, so keep your prompt brief.',
        input: idea,
      })

      const result = response.output_text?.trim() || ''
      if (!result) {
        throw new Error('AI returned an empty response')
      }
      console.log('[AI #1] Transformation result:', result.substring(0, 50) + '...')
      return result
    } catch (error: any) {
      console.error(`[AI #1] Error calling AI API (attempt ${attempt + 1}/${retries}):`, error)
      
      // Check if it's a quota exceeded error (not just rate limit)
      const errorMessage = error?.message || ''
      const isQuotaExceeded = errorMessage.includes('quota') || errorMessage.includes('billing')
      
      // Handle rate limit with exponential backoff (only if not quota exceeded)
      if (error?.status === 429 && !isQuotaExceeded) {
        if (attempt < retries - 1) {
          const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
          console.log(`[AI #1] Rate limited. Retrying in ${delay}ms...`)
          await wait(delay)
          continue
        }
        throw new Error('Rate limit exceeded. Please try again later.')
      }
      
      // Quota exceeded - don't retry, just fail immediately
      if (error?.status === 429 && isQuotaExceeded) {
        throw new Error('OpenAI quota exceeded. Please check your billing and add credits to your account.')
      }
      
      if (error?.status === 401) {
        throw new Error('Invalid API key. Please check your VITE_AI_API_KEY in .env file.')
      }
      
      // If it's the last attempt or not a rate limit, throw the error
      if (attempt === retries - 1 || error?.status !== 429) {
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

