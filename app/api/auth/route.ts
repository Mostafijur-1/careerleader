
import { NextResponse } from 'next/server'
import { getCollection } from '../../../lib/db'
import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'
import { getAuthCookieName, signAuthToken, verifyAuthToken } from '../../../lib/auth'

function mapUserForClient(user: {
  _id?: ObjectId
  email?: string
  type?: string
  name?: string
}) {
  return {
    id: user._id ? String(user._id) : '',
    email: user.email || '',
    type: (user.type || 'student') as 'student' | 'mentor' | 'admin',
    name: user.name || '',
  }
}

function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(getAuthCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

function clearAuthCookie(res: NextResponse) {
  res.cookies.set(getAuthCookieName(), '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

// GET /api/auth/mentors - fetch all mentors for admin
export async function GET(req: Request) {
  const url = new URL(req.url)
  const pathname = url.pathname
  
  // GET /api/auth?mentors=true - fetch all mentors
  if (url.searchParams.has('mentors')) {
    const users = await getCollection('users')
    const mentors = await users.find({ type: 'mentor' }).toArray()
    return NextResponse.json({ 
      mentors: mentors.map(m => ({
        id: m._id,
        email: m.email,
        name: m.name,
        expertise: m.expertise || [],
        active: m.active || false
      }))
    })
  }

  if (url.searchParams.has('me')) {
    const token = req.headers.get('cookie')
      ?.split(';')
      .map(part => part.trim())
      .find(part => part.startsWith(`${getAuthCookieName()}=`))
      ?.split('=')
      .slice(1)
      .join('=')

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    try {
      const user = verifyAuthToken(token)
      return NextResponse.json({ user })
    } catch {
      return NextResponse.json({ user: null }, { status: 401 })
    }
  }

  return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
}

// POST /api/auth/route.ts
// { action: 'register' | 'login', type: 'student' | 'mentor' | 'admin', ...fields }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { action, type, email, password, name, expertise, role, adminEmail, adminPassword, mentorEmail, zoomLink, meetLink } = body
  
  // Skip generic field check for activate/deactivate mentor actions
  if (action !== 'activate-mentor' && action !== 'deactivate-mentor' && action !== 'logout') {
    if (!action || !type || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
  } else {
    // For mentor activation/deactivation, check different fields
    if (!action || !adminEmail || !adminPassword || !mentorEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
  }

  const users = await getCollection('users')

  if (action === 'logout') {
    const res = NextResponse.json({ message: 'Logout successful' })
    clearAuthCookie(res)
    return res
  }

  if (action === 'register') {
    // Check if user exists
    const existing = await users.findOne({ email, type })
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }
    // Hash password
    const hashed = await bcrypt.hash(password, 10)
    let userDoc: any = { email, password: hashed, type, name }
    if (type === 'mentor') {
      userDoc.expertise = expertise || [];
      userDoc.active = false; // mentor must be activated by admin
      userDoc.zoomLink = typeof zoomLink === 'string' ? zoomLink.trim() : ''
      userDoc.meetLink = typeof meetLink === 'string' ? meetLink.trim() : ''
      const {
        careerIds,
        headline,
        bio,
        education,
        currentJob,
        experience,
        rating,
        reviewCount,
      } = body
      if (Array.isArray(careerIds)) {
        userDoc.careerIds = careerIds.filter((x: unknown) => typeof x === 'string')
      }
      if (typeof headline === 'string' && headline.trim()) userDoc.headline = headline.trim()
      if (typeof bio === 'string') userDoc.bio = bio.trim()
      if (Array.isArray(education)) userDoc.education = education
      if (currentJob && typeof currentJob === 'object') userDoc.currentJob = currentJob
      if (Array.isArray(experience)) userDoc.experience = experience
      if (typeof rating === 'number') userDoc.rating = rating
      if (typeof reviewCount === 'number') userDoc.reviewCount = reviewCount
    }
    if (type === 'admin') {
      userDoc.role = role || 'admin';
    }
    const result = await users.insertOne(userDoc)
    return NextResponse.json({ message: 'Registered', user: { id: String(result.insertedId), email, type, name } })
  }

  if (action === 'login') {
    const user = await users.findOne({ email, type })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (type === 'mentor' && user.active === false) {
      return NextResponse.json({ error: 'Mentor account not yet activated by admin' }, { status: 403 })
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const userInfo = mapUserForClient(user)
    const token = signAuthToken(userInfo)
    const res = NextResponse.json({ message: 'Login successful', user: userInfo })
    setAuthCookie(res, token)
    return res
  }

  if (action === 'activate-mentor') {
    // Only admins can activate mentors
    // body should have: adminEmail, adminPassword, mentorEmail
    const { adminEmail, adminPassword, mentorEmail } = body
    if (!adminEmail || !adminPassword || !mentorEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify admin credentials
    const admin = await users.findOne({ email: adminEmail, type: 'admin' })
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }
    const validAdmin = await bcrypt.compare(adminPassword, admin.password)
    if (!validAdmin) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 })
    }

    // Find and activate mentor
    const mentor = await users.findOne({ email: mentorEmail, type: 'mentor' })
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 })
    }

    const result = await users.updateOne(
      { email: mentorEmail, type: 'mentor' },
      { $set: { active: true } }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to activate mentor' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Mentor activated successfully' })
  }

  if (action === 'deactivate-mentor') {
    // Only admins can deactivate mentors
    const { adminEmail, adminPassword, mentorEmail } = body
    if (!adminEmail || !adminPassword || !mentorEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify admin credentials
    const admin = await users.findOne({ email: adminEmail, type: 'admin' })
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }
    const validAdmin = await bcrypt.compare(adminPassword, admin.password)
    if (!validAdmin) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 })
    }

    // Find and deactivate mentor
    const mentor = await users.findOne({ email: mentorEmail, type: 'mentor' })
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 })
    }

    const result = await users.updateOne(
      { email: mentorEmail, type: 'mentor' },
      { $set: { active: false } }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to deactivate mentor' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Mentor deactivated successfully' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
