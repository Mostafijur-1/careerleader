import { NextResponse } from 'next/server'
import { getCollection } from '../../../lib/db'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const email = url.searchParams.get('email')?.trim().toLowerCase()
    const type = url.searchParams.get('type')?.trim()

    if (!email || !type) {
      return NextResponse.json({ error: 'Missing email or type' }, { status: 400 })
    }

    const users = await getCollection('users')
    const userDoc = await users.findOne({ email, type })
    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ goal: userDoc.goal || null })
  } catch (err: any) {
    console.error('Error fetching user goal:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email || '').trim().toLowerCase()
    const type = String(body?.type || '').trim()
    const goal = body?.goal

    if (!email || !type) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const users = await getCollection('users')
    const result = await users.updateOne(
      { email, type },
      { $set: { goal, goalUpdatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, goal })
  } catch (err: any) {
    console.error('Error saving user goal:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
