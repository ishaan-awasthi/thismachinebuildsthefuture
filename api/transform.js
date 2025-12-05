import OpenAI from 'openai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({ error: 'Idea is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const response = await openai.responses.create({
      model: 'gpt-5-nano-2025-08-07',
      reasoning: { effort: 'low' },
      instructions: 'Transform this idea into a string of text that can be used to prompt the behavior of an LLM. Assume it will be added to already existing list of a similar style, so keep your prompt brief.',
      input: idea,
    });

    return res.status(200).json({ 
      prompt: response.output_text?.trim() || '' 
    });
  } catch (error) {
    console.error('Transform API Error:', error);
    return res.status(error.status || 500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}