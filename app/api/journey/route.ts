import { NextResponse } from "next/server"
import { getAuthCookieName, verifyAuthToken } from "@/lib/auth"
import { getCollection } from "@/lib/db"
import type { GeneratedCv } from "@/lib/cvTypes"
import type { JourneyCareer, JourneyState } from "@/lib/journey"

function authFromRequest(req: Request) {
  const token = req.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${getAuthCookieName()}=`))
    ?.split("=")
    .slice(1)
    .join("=")

  if (!token) return null
  try {
    return verifyAuthToken(token)
  } catch {
    return null
  }
}

function cleanStringList(value: unknown, limit = 200) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    .map((item) => item.trim())
    .filter((item, index, items) => items.indexOf(item) === index)
    .slice(0, limit)
}

function cleanCareer(value: unknown): JourneyCareer | null {
  if (!value || typeof value !== "object") return null
  const raw = value as Record<string, unknown>
  const id = typeof raw.id === "string" ? raw.id.trim() : ""
  const title = typeof raw.title === "string" ? raw.title.trim() : ""
  if (!id || !title) return null
  return {
    id,
    title,
    description: typeof raw.description === "string" ? raw.description.trim().slice(0, 600) : "",
    skills: cleanStringList(raw.skills, 20),
  }
}

function cleanCv(value: unknown): GeneratedCv | null {
  if (!value || typeof value !== "object") return null
  const cv = value as GeneratedCv
  if (!cv.fullName?.trim() || !cv.targetRole?.trim()) return null
  return cv
}

export async function GET(req: Request) {
  const auth = authFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const users = await getCollection("users")
  const user = await users.findOne(
    { email: auth.email, type: auth.type },
    { projection: { journey: 1, cvDraft: 1, goal: 1, mbti: 1 } }
  )
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json({
    journey: (user.journey || {}) as JourneyState,
    cvDraft: user.cvDraft || null,
    goal: user.goal || null,
    mbti: user.mbti || "",
  })
}

export async function PATCH(req: Request) {
  const auth = authFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const action = String(body?.action || "")
  const now = new Date()
  const setFields: Record<string, unknown> = {
    "journey.lastActionAt": now,
  }

  if (action === "select-career") {
    const career = cleanCareer(body?.career)
    if (!career) return NextResponse.json({ error: "A valid career is required" }, { status: 400 })
    setFields["journey.selectedCareer"] = career
    setFields["journey.lastAction"] = "career_selected"
  } else if (action === "save-careers") {
    setFields["journey.savedCareerIds"] = cleanStringList(body?.careerIds, 100)
    setFields["journey.lastAction"] = "career_saved"
  } else if (action === "roadmap-progress") {
    const completedTasks = cleanStringList(body?.completedTasks, 500)
    const progress = Number(body?.progress)
    setFields["journey.roadmapCompletedTasks"] = completedTasks
    setFields["journey.roadmapProgress"] = Number.isFinite(progress)
      ? Math.max(0, Math.min(100, Math.round(progress)))
      : 0
    setFields["journey.lastAction"] = "roadmap_progressed"
  } else if (action === "save-cv") {
    const cv = cleanCv(body?.cv)
    if (!cv) return NextResponse.json({ error: "A valid CV is required" }, { status: 400 })
    const completeness = Number(body?.completeness)
    setFields.cvDraft = cv
    setFields["journey.cvUpdatedAt"] = now
    setFields["journey.cvCompleteness"] = Number.isFinite(completeness)
      ? Math.max(0, Math.min(100, Math.round(completeness)))
      : 0
    setFields["journey.lastAction"] = "cv_saved"
  } else {
    return NextResponse.json({ error: "Unsupported journey action" }, { status: 400 })
  }

  const users = await getCollection("users")
  const result = await users.updateOne(
    { email: auth.email, type: auth.type },
    { $set: setFields }
  )
  if (!result.matchedCount) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const updated = await users.findOne(
    { email: auth.email, type: auth.type },
    { projection: { journey: 1, cvDraft: 1 } }
  )
  return NextResponse.json({
    success: true,
    journey: (updated?.journey || {}) as JourneyState,
    cvDraft: updated?.cvDraft || null,
  })
}
