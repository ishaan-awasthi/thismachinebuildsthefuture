import OpenAI from 'openai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, systemPrompt } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
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
      instructions: systemPrompt || '',
      input: message,
    });

    return res.status(200).json({ 
      response: response.output_text?.trim() || 'Sorry, I could not generate a response.' 
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(error.status || 500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}