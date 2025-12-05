# Environment Variables Setup

## Local Development (`.env` file)

Create a `.env` file in the root of your project with:

```env
# OpenAI API Key (NO VITE_ prefix - stays server-side)
OPENAI_API_KEY=sk-proj-your-key-here

# Supabase (VITE_ prefix - safe to expose to browser)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** 
- `OPENAI_API_KEY` has **NO** `VITE_` prefix (server-side only)
- Supabase keys **DO** have `VITE_` prefix (safe to expose)

## Vercel Environment Variables

In your Vercel project settings → Environment Variables, add:

### Production, Preview, and Development:

```env
OPENAI_API_KEY=sk-proj-your-key-here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:**
- ✅ Add `OPENAI_API_KEY` (NO `VITE_` prefix)
- ❌ **DO NOT** add `VITE_AI_API_KEY` (this was the problem!)
- ✅ Keep Supabase variables with `VITE_` prefix

## Why This Matters

- **`VITE_*` variables** = Bundled into client-side JavaScript (visible in browser)
- **Variables without `VITE_`** = Server-side only (never exposed)

Since your API functions use `process.env.OPENAI_API_KEY`, it stays secure on the server.

## Quick Checklist

- [ ] Create `.env` file locally with all 3 variables
- [ ] In Vercel, add `OPENAI_API_KEY` (no VITE_ prefix)
- [ ] In Vercel, add `VITE_SUPABASE_URL` (with VITE_ prefix)
- [ ] In Vercel, add `VITE_SUPABASE_ANON_KEY` (with VITE_ prefix)
- [ ] **Remove** `VITE_AI_API_KEY` from Vercel if it exists
- [ ] Redeploy after updating variables

