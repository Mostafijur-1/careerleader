import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { scoreAssessment } from '../../../lib/assessment'
import { recommend } from '../../../lib/recommendation'
import { getCollection } from '../../../lib/db'
import { getAuthCookieName, verifyAuthToken } from '../../../lib/auth'

type RawQuestion = Record<string, unknown> & {
  id: string
  text: string
  textBn?: string
  optionA?: string
  optionB?: string
  optionAbn?: string
  optionBbn?: string
}

function localizeQuestions(questions: RawQuestion[], lang: 'en' | 'bn'): RawQuestion[] {
  if (lang !== 'bn') return questions
  return questions.map(q => ({
    ...q,
    text: typeof q.textBn === 'string' && q.textBn.trim() ? q.textBn : q.text,
    optionA:
      typeof q.optionAbn === 'string' && q.optionAbn.trim() ? q.optionAbn : q.optionA,
    optionB:
      typeof q.optionBbn === 'string' && q.optionBbn.trim() ? q.optionBbn : q.optionB,
  }))
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const lang: 'en' | 'bn' = url.searchParams.get('lang') === 'bn' ? 'bn' : 'en'
    const filePath = path.join(process.cwd(), 'data', 'assessment_questions.json')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const questions = JSON.parse(fileContent) as RawQuestion[]
    return NextResponse.json(localizeQuestions(questions, lang))
  } catch (error) {
    console.error('Error loading assessment questions:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}))
  const answers = Array.isArray(payload?.answers) ? payload.answers : []

  try {
    const result = scoreAssessment(answers)
    const recs = recommend(result.personality, result.interests || [], 5)

    // Persist the result and the next journey state for the authenticated user.
    const token = req.headers.get('cookie')
      ?.split(';')
      .map(part => part.trim())
      .find(part => part.startsWith(`${getAuthCookieName()}=`))
      ?.split('=')
      .slice(1)
      .join('=')
    let authenticatedUser: ReturnType<typeof verifyAuthToken> | null = null
    if (token) {
      try {
        authenticatedUser = verifyAuthToken(token)
      } catch {
        authenticatedUser = null
      }
    }
    if (authenticatedUser) {
      const users = await getCollection('users')
      const now = new Date()
      await users.updateOne(
        { email: authenticatedUser.email, type: authenticatedUser.type },
        {
          $set: {
            mbti: result.personality,
            mbtiUpdatedAt: now,
            'journey.assessmentCompletedAt': now,
            'journey.recommendedCareerIds': recs.map(rec => rec.id),
            'journey.lastAction': 'assessment_completed',
            'journey.lastActionAt': now,
          },
        }
      )
    }

    return NextResponse.json({ success: true, result, recommendations: recs })
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
