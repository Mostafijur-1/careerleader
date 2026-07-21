import { NextResponse } from 'next/server'
import { getCollection } from '../../../lib/db'
import { getAuthCookieName, verifyAuthToken } from '../../../lib/auth'
import type { Document, UpdateFilter } from 'mongodb'

function authFromRequest(req: Request) {
  const token = req.headers.get('cookie')
    ?.split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${getAuthCookieName()}=`))
    ?.split('=')
    .slice(1)
    .join('=')
  if (!token) return null
  try {
    return verifyAuthToken(token)
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  try {
    const auth = authFromRequest(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const users = await getCollection('users')
    const userDoc = await users.findOne({ email: auth.email, type: auth.type })
    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ goal: userDoc.goal || null })
  } catch (err: unknown) {
    console.error('Error fetching user goal:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to fetch goal' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const auth = authFromRequest(req)
    const goal = body?.goal

    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!goal?.title || typeof goal.title !== 'string') {
      return NextResponse.json({ error: 'A valid goal is required' }, { status: 400 })
    }

    const users = await getCollection('users')
    const now = new Date()
    const existing = await users.findOne(
      { email: auth.email, type: auth.type },
      { projection: { goal: 1, journey: 1 } }
    )
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const title = goal.title.trim()
    const previousTitle = typeof existing.goal?.title === 'string' ? existing.goal.title.trim() : ''
    const goalChanged = Boolean(previousTitle && previousTitle !== title)
    const setFields: Record<string, unknown> = {
      goal: { ...goal, title },
      goalUpdatedAt: now,
      'journey.goalSetAt': now,
      'journey.roadmapCompletedTasks': [],
      'journey.roadmapProgress': 0,
      'journey.lastAction': 'goal_set',
      'journey.lastActionAt': now,
    }
    if (!existing.journey?.selectedCareer) {
      setFields['journey.selectedCareer'] = {
        id: `goal:${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'career'}`,
        title,
        skills: Array.isArray(goal.focusAreas) ? goal.focusAreas : [],
      }
    }
    const update: UpdateFilter<Document> = { $set: setFields }
    if (goalChanged) {
      update.$unset = {
        cvDraft: '',
        'journey.cvUpdatedAt': '',
        'journey.cvCompleteness': '',
      }
    }
    const result = await users.updateOne(
      { email: auth.email, type: auth.type },
      update
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updated = await users.findOne(
      { email: auth.email, type: auth.type },
      { projection: { journey: 1, cvDraft: 1 } }
    )
    return NextResponse.json({ success: true, goal: { ...goal, title }, journey: updated?.journey || {}, cvDraft: updated?.cvDraft || null })
  } catch (err: unknown) {
    console.error('Error saving user goal:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to save goal' }, { status: 500 })
  }
}
