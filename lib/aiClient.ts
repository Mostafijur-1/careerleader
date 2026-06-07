import OpenAI from 'openai';

export function getAiClient() {
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Neither GROQ_API_KEY nor GEMINI_API_KEY is configured in environment variables.");
  }

  const isGroq = !!process.env.GROQ_API_KEY;
  const baseURL = isGroq
    ? 'https://api.groq.com/openai/v1'
    : 'https://generativelanguage.googleapis.com/v1beta/openai/';

  const model = isGroq
    ? 'llama-3.3-70b-versatile'
    : (process.env.GEMINI_MODEL || 'gemini-2.5-flash');

  const client = new OpenAI({
    apiKey: apiKey.split(',')[0].trim(), // support comma-separated fallback lists even in legacy getAiClient
    baseURL,
  });

  return { client, model, isGroq };
}

interface AiProvider {
  name: string;
  client: OpenAI;
  model: string;
}

export function getAiProviders(): AiProvider[] {
  const providers: AiProvider[] = [];

  // Parse Groq keys (can be comma-separated list of multiple keys for rotation/fallback)
  const groqKeysRaw = process.env.GROQ_API_KEY || '';
  const groqKeys = groqKeysRaw.split(',').map(k => k.trim()).filter(Boolean);
  
  groqKeys.forEach((key, idx) => {
    providers.push({
      name: groqKeys.length > 1 ? `Groq Key ${idx + 1}` : 'Groq',
      client: new OpenAI({
        apiKey: key,
        baseURL: 'https://api.groq.com/openai/v1',
      }),
      model: 'llama-3.3-70b-versatile',
    });
  });

  // Parse Gemini keys (can be comma-separated list of multiple keys for rotation/fallback)
  const geminiKeysRaw = process.env.GEMINI_API_KEY || '';
  const geminiKeys = geminiKeysRaw.split(',').map(k => k.trim()).filter(Boolean);

  geminiKeys.forEach((key, idx) => {
    providers.push({
      name: geminiKeys.length > 1 ? `Gemini Key ${idx + 1}` : 'Gemini',
      client: new OpenAI({
        apiKey: key,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      }),
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    });
  });

  return providers;
}

export async function createChatCompletion(options: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
}) {
  const providers = getAiProviders();
  if (providers.length === 0) {
    throw new Error("No AI providers configured. Please set GROQ_API_KEY or GEMINI_API_KEY in .env.local.");
  }

  let lastError: any = null;
  for (const provider of providers) {
    try {
      console.log(`Attempting completion using provider: ${provider.name}`);
      const completion = await provider.client.chat.completions.create({
        model: provider.model,
        messages: options.messages as any,
        temperature: options.temperature ?? 0.7,
      });
      return {
        response: completion.choices[0].message.content,
        model: provider.model,
        provider: provider.name,
      };
    } catch (err: any) {
      console.warn(`Provider ${provider.name} failed:`, err?.message || err);
      lastError = err;
      // Loop continues to next provider/key on failure
    }
  }

  throw new Error(`All AI providers/keys failed. Last error: ${lastError?.message || lastError}`);
}
