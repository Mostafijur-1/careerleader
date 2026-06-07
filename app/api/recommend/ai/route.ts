import { NextResponse } from 'next/server';
import { createChatCompletion } from '@/lib/aiClient';

export async function POST(req: Request) {
  try {
    const { personality, interests } = await req.json(); // e.g. "INFP", ["coding", "design"]
    const safeInterests = Array.isArray(interests) ? interests : [];

    const prompt = `
      Student Personality MBTI: ${personality}
      Student Interests: ${safeInterests.join(', ')}
      Analyze these characteristics and output a personalized career recommendation structure.
      You must respond with a SINGLE JSON object of this structure (no markdown backticks, no text before or after):
      {
        "career_title": "<Recommended career title>",
        "reasoning": "<Why this matches their personality and interests>",
        "skills_to_learn": ["<skill 1>", "<skill 2>", "<skill 3>"],
        "roadmap_steps": [
          "Step 1: <First immediate milestone>",
          "Step 2: <Intermediate goal>",
          "Step 3: <Career entry action>"
        ]
      }
    `;

    const { response } = await createChatCompletion({
      messages: [{ role: 'user', content: prompt } as any],
      temperature: 0.3, // Low temperature for high format compliance
    });

    const responseText = response || '{}';

    // Strip markdown code fences if outputted
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith('```')) {
      const match = jsonStr.match(/^```(?:json)?\s*([\s\S]*?)```$/);
      if (match?.[1]) {
        jsonStr = match[1].trim();
      }
    }

    const structuredJSON = JSON.parse(jsonStr);
    return NextResponse.json(structuredJSON);
  } catch (error: any) {
    console.error('AI Recommendation Error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}
