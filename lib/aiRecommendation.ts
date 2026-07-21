import { GoogleGenerativeAI } from "@google/generative-ai"

type Recommendation = {
  id: string
  title: string
  description?: string
  skills?: string[]
}

// Override with GEMINI_MODEL. Default is Pro; for free-tier-only use e.g. gemini-2.5-flash-lite.
const MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-pro"

function toRecommendation(raw: unknown, idx: number): Recommendation | null {
  if (!raw || typeof raw !== "object") return null
  const item = raw as Record<string, unknown>
  const title = typeof item.title === "string" ? item.title.trim() : ""
  if (!title) return null

  const description = typeof item.description === "string" ? item.description.trim() : ""
  const skills = Array.isArray(item.skills)
    ? item.skills
        .filter((skill): skill is string => typeof skill === "string" && skill.trim().length > 0)
        .slice(0, 6)
    : []

  return {
    id: `ai-${idx + 1}`,
    title,
    description,
    skills,
  }
}

function extractJsonObject(text: string): string {
  const trimmed = text.trim()
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m)
  if (fence?.[1]) return fence[1].trim()
  const start = trimmed.indexOf("{")
  const end = trimmed.lastIndexOf("}")
  if (start !== -1 && end > start) return trimmed.slice(start, end + 1)
  return trimmed
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isRateLimitedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return (
    msg.includes("429") ||
    msg.includes("Too Many Requests") ||
    msg.includes("RESOURCE_EXHAUSTED")
  )
}

/** Parse server hint like "Please retry in 2.7s" (Gemini 429 responses). */
function retryDelayMsFromError(err: unknown): number {
  const msg = err instanceof Error ? err.message : String(err)
  const m = msg.match(/Please retry in ([\d.]+)s/i)
  if (m) {
    const sec = parseFloat(m[1])
    if (!Number.isNaN(sec)) return Math.min(Math.ceil(sec * 1000) + 250, 60_000)
  }
  return 3500
}

export async function getAiRecommendations(
  personality: string,
  interests: string[] = [],
  limit = 5
): Promise<Recommendation[]> {
  const apiKeyRaw = process.env.GEMINI_API_KEY
  if (!apiKeyRaw) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  const apiKeys = apiKeyRaw.split(',').map(k => k.trim()).filter(Boolean)
  if (apiKeys.length === 0) {
    throw new Error("GEMINI_API_KEY is configured but has no valid keys")
  }

  const safeInterests = (interests || []).filter(Boolean).slice(0, 8)
  const prompt = `You are a career guidance assistant. Return only valid JSON with this exact shape (no markdown, no extra keys at root):
{"recommendations": [{"title": string, "description": string, "skills": string[]}]}

Suggest up to ${limit} career recommendations for MBTI type "${personality}" and interests [${safeInterests.join(", ")}]. Make descriptions practical and concise.`

  let lastErr: unknown
  for (let idx = 0; idx < apiKeys.length; idx++) {
    const apiKey = apiKeys[idx]
    const keyLabel = apiKeys.length > 1 ? `Gemini Key ${idx + 1}` : 'Gemini'
    try {
      console.log(`Attempting career recommendations using: ${keyLabel}`)
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: MODEL,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      })

      const maxAttempts = 3
      let result: Awaited<ReturnType<typeof model.generateContent>> | null = null
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          result = await model.generateContent(prompt)
          break
        } catch (err) {
          lastErr = err
          if (!isRateLimitedError(err) || attempt === maxAttempts) {
            throw err
          }
          await sleep(retryDelayMsFromError(err))
        }
      }
      if (!result) throw lastErr

      const text = result.response.text()
      if (!text) return []

      const jsonStr = extractJsonObject(text)
      const parsed = JSON.parse(jsonStr) as { recommendations?: unknown[] }
      const items = Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      return items.map(toRecommendation).filter((x): x is Recommendation => x !== null).slice(0, limit)
    } catch (err: unknown) {
      console.warn(`${keyLabel} failed:`, err instanceof Error ? err.message : err)
      lastErr = err
      // Continue to next key
    }
  }

  throw new Error(`All Gemini API keys failed. Last error: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`)
}

export interface SectorAssessmentPayload {
  sector: string
  generalAnswers: Array<{ question: string; answer: string; value?: string }>
  sectorAnswers: Array<{ question: string; answer: string; value?: string }>
}

export async function getSectorRecommendations(
  personality: string,
  assessment: SectorAssessmentPayload,
  limit = 5
): Promise<Recommendation[]> {
  const apiKeyRaw = process.env.GEMINI_API_KEY
  if (!apiKeyRaw) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  const apiKeys = apiKeyRaw.split(',').map(k => k.trim()).filter(Boolean)
  if (apiKeys.length === 0) {
    throw new Error("GEMINI_API_KEY is configured but has no valid keys")
  }

  const generalText = (assessment.generalAnswers || [])
    .map(a => `- Question: "${a.question}"\n  Answer: "${a.answer}"`)
    .join("\n")

  const sectorText = (assessment.sectorAnswers || [])
    .map(a => `- Question: "${a.question}"\n  Answer: "${a.answer}"`)
    .join("\n")

  const prompt = `You are a career guidance assistant. Return only valid JSON with this exact shape (no markdown, no extra keys at root):
{"recommendations": [{"title": string, "description": string, "skills": string[]}]}

Suggest up to ${limit} career recommendations for a student with MBTI personality type "${personality}" in the target sector "${assessment.sector.toUpperCase()}".

Here are their answers regarding general career interests:
${generalText}

Here are their answers specific to their target sector:
${sectorText}

Provide practical, highly specific career recommendations matching their profile and answers. Limit each recommendation's description to 2 concise sentences.`

  let lastErr: unknown
  for (let idx = 0; idx < apiKeys.length; idx++) {
    const apiKey = apiKeys[idx]
    const keyLabel = apiKeys.length > 1 ? `Gemini Key ${idx + 1}` : 'Gemini'
    try {
      console.log(`Attempting sector-based career recommendations using: ${keyLabel}`)
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: MODEL,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      })

      const maxAttempts = 3
      let result: Awaited<ReturnType<typeof model.generateContent>> | null = null
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          result = await model.generateContent(prompt)
          break
        } catch (err) {
          lastErr = err
          if (!isRateLimitedError(err) || attempt === maxAttempts) {
            throw err
          }
          await sleep(retryDelayMsFromError(err))
        }
      }
      if (!result) throw lastErr

      const text = result.response.text()
      if (!text) return []

      const jsonStr = extractJsonObject(text)
      const parsed = JSON.parse(jsonStr) as { recommendations?: unknown[] }
      const items = Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      return items.map(toRecommendation).filter((x): x is Recommendation => x !== null).slice(0, limit)
    } catch (err: unknown) {
      console.warn(`${keyLabel} failed:`, err instanceof Error ? err.message : err)
      lastErr = err
      // Continue to next key
    }
  }

  throw new Error(`All Gemini API keys failed. Last error: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`)
}

