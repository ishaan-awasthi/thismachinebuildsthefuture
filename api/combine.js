import OpenAI from 'openai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ideas } = req.body;

    if (!ideas || !Array.isArray(ideas) || ideas.length === 0) {
      return res.status(400).json({ error: 'Ideas array is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const promptText = ideas.join('\n- ');

    console.log('[combine] ideas count:', ideas.length);
    console.log('[combine] texts used to make prompt:');
    ideas.forEach((idea, index) => {
      console.log(`[combine]   ${index + 1}. ${idea.substring(0, 100)}${idea.length > 100 ? '...' : ''}`);
    });

    const response = await openai.responses.create({
      model: 'gpt-5-nano-2025-08-07',
      reasoning: { effort: 'low' },
      instructions:
        "Combine these described AI behaviors into a single AI prompt that achieves all the behaviors while reducing complexity and eliminating redundancies or contradictions. Don't include anything else in your response, just the new full combined prompt.",
      input: promptText,
    });

    const combined = response.output_text?.trim() || '';
    console.log('[combine] combined prompt preview:', combined.substring(0, 200));

    return res.status(200).json({
      combinedPrompt: combined,
    });
  } catch (error) {
    console.error('Combine API Error:', error);
    return res.status(error.status || 500).json({
      error: error.message || 'Internal server error',
    });
  }
}

