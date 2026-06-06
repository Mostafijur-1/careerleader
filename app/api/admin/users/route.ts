import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { getAuthCookieName, verifyAuthToken } from '@/lib/auth'

function getAdminUser(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const cookieName = getAuthCookieName()
    const token = cookieHeader
      .split(';')
      .map(part => part.trim())
      .find(part => part.startsWith(`${cookieName}=`))
      ?.split('=')
      .slice(1)
      .join('=')

    if (!token) return null
    const user = verifyAuthToken(token)
    if (user && user.type === 'admin') {
      return user
    }
  } catch {
    // ignore
  }
  return null
}

export async function GET(req: Request) {
  const admin = getAdminUser(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await getCollection('users')
    const allUsers = await users.find({ type: { $ne: 'admin' } }).toArray()

    const mappedUsers = allUsers.map(u => ({
      id: String(u._id),
      email: u.email,
      name: u.name || '',
      type: u.type || 'student',
      active: u.active ?? (u.type === 'student'), // mentors are inactive by default, students active by default
      blocked: u.blocked || false,
      expertise: Array.isArray(u.expertise) ? u.expertise : [],
      mbti: u.mbti || '',
    }))

    return NextResponse.json({ users: mappedUsers })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const admin = getAdminUser(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { action, userId } = body

    if (!action || !userId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const users = await getCollection('users')
    const oid = new ObjectId(userId)

    const userDoc = await users.findOne({ _id: oid })
    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (action === 'toggle-active' && userDoc.type === 'mentor') {
      const nextActive = !userDoc.active
      await users.updateOne({ _id: oid }, { $set: { active: nextActive } })
      return NextResponse.json({ success: true, active: nextActive })
    }

    if (action === 'toggle-block' && userDoc.type === 'student') {
      const nextBlocked = !userDoc.blocked
      await users.updateOne({ _id: oid }, { $set: { blocked: nextBlocked } })
      return NextResponse.json({ success: true, blocked: nextBlocked })
    }

    if (action === 'delete') {
      await users.deleteOne({ _id: oid })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action or user type' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
