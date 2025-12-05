# Vercel API Setup - Securing Your OpenAI Key

## What Happened

When you added `VITE_AI_API_KEY` to Vercel environment variables, Vite bundled it into the client-side JavaScript. This exposed your API key in the browser, which OpenAI detected and cancelled your key.

## Solution: Use Vercel Serverless Functions

I've updated your code to use Vercel serverless functions. The API key now stays on the server and is never exposed to the browser.

## Setup Instructions

### 1. Update Vercel Environment Variables

In your Vercel project settings:

**REMOVE:**
- ❌ `VITE_AI_API_KEY` (no longer needed in frontend)

**ADD/UPDATE:**
- ✅ `OPENAI_API_KEY` (server-side only, no `VITE_` prefix)
- ✅ Keep `VITE_SUPABASE_URL` (safe to expose)
- ✅ Keep `VITE_SUPABASE_ANON_KEY` (safe to expose)

### 2. Install OpenAI SDK in API Functions

The API functions need the OpenAI package. Run:

```bash
npm install openai
```

### 3. Verify API Routes

Your API routes are in:
- `/api/transform.js` - Transforms user ideas to prompts
- `/api/chat.js` - Handles chatbot messages

These will automatically work as Vercel serverless functions when deployed.

### 4. Redeploy

After updating environment variables:
1. Remove `VITE_AI_API_KEY` from Vercel
2. Add `OPENAI_API_KEY` (without `VITE_` prefix)
3. Redeploy your project

## How It Works Now

### Before (Insecure):
```
Browser → OpenAI API (with exposed key)
```

### After (Secure):
```
Browser → Vercel Serverless Function → OpenAI API (key stays on server)
```

## API Endpoints

### POST `/api/transform`
Transforms user ideas into system prompts.

**Request:**
```json
{
  "idea": "user's idea text"
}
```

**Response:**
```json
{
  "prompt": "transformed prompt text"
}
```

### POST `/api/chat`
Handles chatbot messages.

**Request:**
```json
{
  "message": "user's chat message",
  "systemPrompt": "concatenated system prompts"
}
```

**Response:**
```json
{
  "response": "AI's response"
}
```

## Security Benefits

✅ **API key never exposed** - Stays in serverless function environment
✅ **No client-side key** - Removed from frontend code
✅ **Vercel handles security** - Environment variables are server-side only
✅ **Same functionality** - Everything works the same, just more secure

## Testing Locally

For local development, create a `.env.local` file:

```env
OPENAI_API_KEY=your_key_here
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

Vercel CLI will automatically use these when running `vercel dev`.

