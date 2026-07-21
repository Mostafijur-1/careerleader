import { NextResponse } from 'next/server'
import { recommendByPersonality } from '../../../lib/recommendation'
import { getAiRecommendations, getSectorRecommendations } from '../../../lib/aiRecommendation'

export async function POST(req: Request) {
  const { personality, choice, assessment } = await req.json().catch(() => ({}))
  
  const mbti = String(personality || '').trim()
  const studentChoice = String(choice || '').trim()

  if (assessment) {
    try {
      const aiRecs = await getSectorRecommendations(mbti, assessment)
      if (aiRecs && aiRecs.length > 0) {
        return NextResponse.json({ recommendations: aiRecs })
      }
    } catch (err) {
      console.error("Gemini AI sector recommendation failed:", err)
    }
  } else if (studentChoice) {
    try {
      const aiRecs = await getAiRecommendations(mbti, [studentChoice], 5)
      if (aiRecs && aiRecs.length > 0) {
        return NextResponse.json({ recommendations: aiRecs })
      }
    } catch (err) {
      console.error("Gemini AI career recommendation failed:", err)
    }
  }

  // Fallback to static local matching
  const recs = recommendByPersonality(mbti)
  return NextResponse.json({ recommendations: recs })
}

