import { NextResponse } from 'next/server'
import { createChatCompletion } from '@/lib/aiClient'
import type { CvGenerateRequest, GeneratedCv } from '@/lib/cvTypes'

function buildFallbackCv(body: CvGenerateRequest): GeneratedCv {
  const { goal, profile } = body
  const name = profile.name?.trim() || 'Your Name'
  const targetRole = goal.title?.trim() || 'Target Role'
  const skills = [
    ...(profile.skills || []),
    ...(goal.focusAreas || []),
  ].filter((s, i, arr) => s && arr.indexOf(s) === i).slice(0, 12)

  return {
    fullName: name,
    headline: `${targetRole} — ${goal.skillLevel || 'Aspiring'} Professional`,
    summary:
      profile.bio?.trim() ||
      goal.whyImportant?.trim() ||
      `Motivated ${goal.skillLevel?.toLowerCase() || 'aspiring'} professional targeting a career as ${targetRole}. Focused on ${(goal.focusAreas || []).join(', ') || 'core industry skills'}.`,
    email: profile.email,
    skills,
    experience: [],
    education: profile.education?.length
      ? profile.education
      : [{ degree: 'Degree / Program', institution: 'Institution', year: 'Year' }],
    projects: (goal.focusAreas || []).slice(0, 2).map((area) => ({
      name: `${area} Portfolio Project`,
      description: `Hands-on project demonstrating ${area.toLowerCase()} skills aligned with ${targetRole} career goals.`,
      technologies: [area],
    })),
    certifications: [],
    targetRole,
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CvGenerateRequest
    const goal = body?.goal
    const profile = body?.profile || {}
    const lang = body?.lang === 'bn' ? 'bn' : 'en'

    if (!goal?.title?.trim()) {
      return NextResponse.json({ error: 'Career goal title is required' }, { status: 400 })
    }

    const fallback = buildFallbackCv(body)

    try {
      const prompt = `
You are an expert career coach and resume writer. Generate a tailored CV/resume for a student targeting their career goal.

Career Goal: ${goal.title}
Target Date: ${goal.targetDate || 'Not specified'}
Skill Level: ${goal.skillLevel || 'Beginner'}
Why This Matters: ${goal.whyImportant || 'Not provided'}
Focus Areas: ${(goal.focusAreas || []).join(', ') || 'Not specified'}

Candidate Profile:
- Name: ${profile.name || 'Student'}
- Email: ${profile.email || 'Not provided'}
- Bio: ${profile.bio || 'Not provided'}
- Existing Skills: ${(profile.skills || []).join(', ') || 'None listed'}
- Education: ${JSON.stringify(profile.education || [])}
- MBTI: ${profile.mbti || 'Not provided'}

Language: ${lang === 'bn' ? 'Write all text content in Bangla (বাংলা), but keep JSON keys in English.' : 'Write all text content in English.'}

Rules:
- Tailor the headline, summary, skills, projects, and experience suggestions specifically to the career goal.
- For ${goal.skillLevel || 'Beginner'} level, suggest realistic entry-level or internship-style experience and projects — do NOT invent senior job titles.
- Include 4-8 relevant skills mixing profile skills and goal focus areas.
- Include 1-3 suggested projects aligned with the goal (even if hypothetical/portfolio-style).
- Include 0-2 experience entries only if plausible for the skill level (internships, freelance, academic projects framed as experience).
- Use provided education when available; otherwise suggest a placeholder entry.
- Keep summary to 2-3 sentences.

Respond with ONLY a valid JSON object (no markdown fences):
{
  "fullName": string,
  "headline": string,
  "summary": string,
  "email": string,
  "skills": string[],
  "experience": [{ "role": string, "organization": string, "period": string, "highlights": string[] }],
  "education": [{ "degree": string, "institution": string, "year": string }],
  "projects": [{ "name": string, "description": string, "technologies": string[] }],
  "certifications": string[],
  "targetRole": string
}
`

      const { response } = await createChatCompletion({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      })

      let jsonStr = (response || '').trim()
      if (jsonStr.startsWith('```')) {
        const match = jsonStr.match(/^```(?:json)?\s*([\s\S]*?)```$/)
        if (match?.[1]) jsonStr = match[1].trim()
      }

      const parsed = JSON.parse(jsonStr) as GeneratedCv
      const cv: GeneratedCv = {
        fullName: parsed.fullName || fallback.fullName,
        headline: parsed.headline || fallback.headline,
        summary: parsed.summary || fallback.summary,
        email: parsed.email || profile.email || fallback.email,
        skills: Array.isArray(parsed.skills) && parsed.skills.length ? parsed.skills : fallback.skills,
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        education: Array.isArray(parsed.education) && parsed.education.length ? parsed.education : fallback.education,
        projects: Array.isArray(parsed.projects) ? parsed.projects : fallback.projects,
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
        targetRole: parsed.targetRole || goal.title,
      }

      return NextResponse.json({ cv, source: 'ai' })
    } catch (aiErr) {
      console.warn('AI CV generation failed, using fallback template:', aiErr)
      return NextResponse.json({ cv: fallback, source: 'fallback' })
    }
  } catch (error: unknown) {
    console.error('CV generation error:', error)
    return NextResponse.json({ error: 'Failed to generate CV' }, { status: 500 })
  }
}
