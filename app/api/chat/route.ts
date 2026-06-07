import { NextResponse } from 'next/server';
import { scrubPII } from '@/lib/piiScrubber';
import { createChatCompletion } from '@/lib/aiClient';

const SYSTEM_PROMPT = `
You are Career Leader AI — an empathetic and knowledgeable career counselor for students in Bangladesh.
═══ LANGUAGE DETECTION & RESPONSE RULES ═══
1. Detect user's language:
   - Bengali script input -> Respond in Bengali (বাংলা).
   - Banglish input (e.g. "amr computer science valo lage, ki korbo?") -> Respond in Bengali (বাংলা).
   - English input -> Respond strictly in English.
═══ SAFETY & RESPONSE RULES ═══
- Do not make absolute promises about job placements.
- Suggest actionable academic pathways (e.g., HSC, BUET, Dhaka University, polytechnic routes).
- Encourage the user to contact one of the active mentors on the platform.
`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    const cleanMessage = scrubPII(message);

    const { response, model } = await createChatCompletion({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: cleanMessage },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({
      response,
      model,
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Failed to fetch AI response' }, { status: 500 });
  }
}
