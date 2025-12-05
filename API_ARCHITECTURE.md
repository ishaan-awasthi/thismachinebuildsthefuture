# API Architecture Analysis

## Overview
This project uses a **dual-AI system** with Supabase as the database backend. All API calls are made directly from the browser (client-side), using environment variables exposed via Vite's `VITE_` prefix.

## Environment Variables

```
VITE_SUPABASE_URL=https://sfiejaoifjesomethingzdsrd.supabase.co
VITE_SUPABASE_ANON_KEY=something
VITE_AI_API_KEY=sk-proj-something
VITE_AI_API_URL=https://api.openai.com/v1/chat/completions
```

**Note**: All variables are exposed to the browser since they use the `VITE_` prefix. This is intentional for this architecture.

## Architecture Components

### 1. Supabase (Database Backend)
- **Purpose**: Stores user submissions and transformed system prompts
- **Tables**:
  - `submissions`: Raw user ideas
  - `system_prompts`: AI-transformed prompts (unique set)
- **Connection**: Client-side via `@supabase/supabase-js`
- **Security**: Uses anon key with Row Level Security (RLS) policies

### 2. OpenAI API (Two Separate AI Systems)

#### AI #1: Idea Transformer
- **Location**: `src/lib/api.ts` → `transformIdeaToPrompt()`
- **Purpose**: Transforms user ideas into system prompt instructions
- **Model**: `gpt-5-nano-2025-08-07`
- **API Endpoint**: `openai.responses.create()`
- **Input**: User's raw idea text
- **Output**: Transformed prompt text
- **Retry Logic**: 3 attempts with exponential backoff (1s, 2s, 4s) for rate limits
- **Error Handling**: Distinguishes between quota exceeded vs rate limits

#### AI #2: Chatbot
- **Location**: `src/pages/ChatPage.tsx` → `handleSubmit()`
- **Purpose**: Interactive chatbot that uses accumulated system prompts
- **Model**: `gpt-5-nano-2025-08-07`
- **API Endpoint**: `openai.responses.create()`
- **Input**: User chat message + concatenated system prompts
- **Output**: AI response
- **System Prompt**: Built from all unique transformed prompts in database

## Data Flow

### Submission Flow (Landing Page → Database)

```
User submits idea
    ↓
1. saveSubmission(idea)
   → Supabase: INSERT INTO submissions (idea)
   → Returns: Saved submission with ID
    ↓
2. transformIdeaToPrompt(idea)
   → OpenAI API: responses.create()
   → Model: gpt-5-nano-2025-08-07
   → Instructions: "Transform this idea into a prompt..."
   → Returns: Transformed prompt text
    ↓
3. addSystemPrompt(transformedPrompt)
   → Supabase: Check if prompt exists (UNIQUE constraint)
   → If new: INSERT INTO system_prompts (prompt_text)
   → If duplicate: Skip (maintains unique set)
    ↓
4. Navigate to /chat
```

### Chat Flow (Chat Page)

```
User sends message
    ↓
1. Load system prompts
   → getConcatenatedSystemPrompt()
   → Supabase: SELECT * FROM system_prompts
   → Concatenate all unique prompts with \n\n
    ↓
2. Send to AI
   → OpenAI API: responses.create()
   → Model: gpt-5-nano-2025-08-07
   → Instructions: Concatenated system prompts (or empty)
   → Input: User's chat message
   → Returns: AI response
    ↓
3. Display response
   → Add to messages array
   → Render in chat interface
```

### Timeline Flow (Timeline Page)

```
Page loads
    ↓
1. Load submissions
   → Supabase: SELECT * FROM submissions ORDER BY created_at
   → Returns: All submissions chronologically
    ↓
2. Display timeline
   → Render each submission with date
   → Fade in animations
```

## Key API Functions

### Supabase Operations

1. **saveSubmission(idea: string)**
   - Inserts user idea into `submissions` table
   - Returns the saved submission with ID

2. **getAllSubmissions()**
   - Fetches all submissions ordered by creation date
   - Used by TimelinePage

3. **getSystemPrompts()**
   - Fetches all system prompts from database
   - Used to build chatbot instructions

4. **addSystemPrompt(promptText: string)**
   - Checks for duplicates (UNIQUE constraint)
   - Only inserts if prompt doesn't exist
   - Maintains a unique set of prompts

5. **getConcatenatedSystemPrompt()**
   - Fetches all prompts
   - Uses Set to ensure uniqueness
   - Joins with `\n\n` separator
   - Returns empty string if no prompts

### OpenAI Operations

1. **transformIdeaToPrompt(idea: string)**
   - Calls `openai.responses.create()`
   - Transforms user idea into system prompt format
   - Retry logic for rate limits
   - Error handling for quota/billing issues

2. **Chatbot (in ChatPage)**
   - Creates new OpenAI client instance
   - Calls `openai.responses.create()` with:
     - System prompts as `instructions`
     - User message as `input`
   - Returns AI response

## Security Considerations

### Supabase
- ✅ **Anon key is safe**: Designed for client-side use
- ✅ **RLS policies**: Protect data access
- ✅ **UNIQUE constraints**: Prevent duplicate prompts

### OpenAI API Key
- ⚠️ **Exposed to browser**: All `VITE_` variables are public
- ⚠️ **Cost risk**: Anyone can use your API key
- ✅ **Mitigation**: Set spending limits in OpenAI dashboard
- 💡 **Future**: Consider backend proxy for production

## Error Handling

### Rate Limits
- **AI #1**: Retries 3 times with exponential backoff
- **AI #2**: Shows error message to user
- Distinguishes between rate limits and quota exceeded

### Database Errors
- All Supabase operations have try/catch
- Errors logged to console
- User-friendly error messages

### Partial Success
- Submissions are saved even if AI transformation fails
- User can retry AI transformation later
- Database maintains all submissions

## API Call Patterns

### Sequential (Submission Flow)
```
saveSubmission() → transformIdeaToPrompt() → addSystemPrompt()
```
Each step waits for the previous to complete.

### Independent (Chat Flow)
```
getConcatenatedSystemPrompt() → openai.responses.create()
```
System prompt loaded once, then used for all chat messages.

### Read-Only (Timeline Flow)
```
getAllSubmissions() → Display
```
Simple fetch and display pattern.

## Performance Considerations

1. **System Prompt Caching**: Loaded once on ChatPage mount
2. **Unique Set Logic**: Prevents duplicate prompts in database
3. **Retry Logic**: Handles temporary API failures
4. **Error Recovery**: Submissions saved even if AI fails

## Current Limitations

1. **API Key Exposure**: OpenAI key visible in browser
2. **No Backend**: All logic runs client-side
3. **Rate Limits**: No queue system for failed requests
4. **No Caching**: System prompts fetched on every chat page load

## Future Improvements

1. **Backend API**: Proxy OpenAI calls through server
2. **Request Queue**: Queue failed AI transformations for retry
3. **Caching**: Cache system prompts in localStorage
4. **Webhooks**: Process AI transformations asynchronously

