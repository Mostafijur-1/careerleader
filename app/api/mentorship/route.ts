import { NextResponse } from 'next/server'
import { getCollection } from '../../../lib/db'
import mentorShowcase from '../../../data/mentor_showcase.json'
import type { CareerCategory } from '../../../lib/mentorProfile'
import { mentorMatchesCategory } from '../../../lib/mentorProfile'

type ChatMessage = {
  studentEmail: string
  mentorEmail: string
  senderEmail: string
  senderType: 'student' | 'mentor'
  text: string
  createdAt: Date
}

type MentorshipRequest = {
  studentEmail: string
  mentorEmail: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (action === 'mentors') {
    const rawCategory = (url.searchParams.get('category') || '').trim().toLowerCase()
    const category: CareerCategory | null = ['job', 'higher_study', 'entrepreneurship'].includes(rawCategory)
      ? (rawCategory as CareerCategory)
      : null

    const users = await getCollection('users')
    const mentors = await users.find({ type: 'mentor', active: true }).toArray()

    const mapDb = (m: Record<string, unknown>) => {
      const expertise: string[] = Array.isArray(m.expertise) ? (m.expertise as string[]) : []
      const careerIds: string[] = Array.isArray(m.careerIds)
        ? (m.careerIds as string[]).filter((x): x is string => typeof x === 'string')
        : []
      const headline =
        typeof m.headline === 'string' && m.headline.trim()
          ? String(m.headline).trim()
          : expertise[0]
            ? `${expertise[0]} mentor`
            : 'Career mentor'
      const education = Array.isArray(m.education) ? m.education : []
      const experience = Array.isArray(m.experience) ? m.experience : []
      const currentJob =
        m.currentJob && typeof m.currentJob === 'object' && m.currentJob !== null ? m.currentJob : null
      return {
        id: String(m._id),
        demo: false,
        email: String(m.email || '').toLowerCase(),
        name: String(m.name || 'Mentor'),
        careerIds,
        headline,
        role: headline,
        education,
        currentJob,
        experience,
        bio: typeof m.bio === 'string' ? m.bio : '',
        expertise,
        rating: typeof m.rating === 'number' ? m.rating : 4.6,
        reviews: typeof m.reviewCount === 'number' ? m.reviewCount : 100,
        recommended: m.recommended !== false,
        zoomLink: typeof m.zoomLink === 'string' ? m.zoomLink : '',
        meetLink: typeof m.meetLink === 'string' ? m.meetLink : '',
      }
    }

    const dbList = mentors.map(m => mapDb(m as Record<string, unknown>))
    const showcaseList = (mentorShowcase as Record<string, unknown>[]).map(row => ({
      id: String(row.id || row.name || 'demo'),
      demo: true,
      email: typeof row.email === 'string' ? row.email.toLowerCase() : '',
      name: String(row.name || 'Mentor'),
      careerIds: Array.isArray(row.careerIds) ? (row.careerIds as string[]).filter(Boolean) : [],
      headline: String(row.headline || row.role || 'Career mentor'),
      role: String(row.headline || 'Career mentor'),
      education: Array.isArray(row.education) ? row.education : [],
      currentJob: row.currentJob && typeof row.currentJob === 'object' ? row.currentJob : null,
      experience: Array.isArray(row.experience) ? row.experience : [],
      bio: typeof row.bio === 'string' ? row.bio : '',
      expertise: Array.isArray(row.expertise) ? (row.expertise as string[]) : [],
      rating: typeof row.rating === 'number' ? row.rating : 4.6,
      reviews: typeof row.reviews === 'number' ? row.reviews : 100,
      recommended: row.recommended !== false,
      zoomLink: typeof row.zoomLink === 'string' ? row.zoomLink : '',
      meetLink: typeof row.meetLink === 'string' ? row.meetLink : '',
    }))

    const dbEmails = new Set(dbList.map(m => m.email).filter(Boolean))
    const merged = [...dbList, ...showcaseList.filter(s => !s.email || !dbEmails.has(s.email))]

    const filtered = category
      ? merged.filter(m => mentorMatchesCategory(m.careerIds, category))
      : merged

    return NextResponse.json({ mentors: filtered })
  }

  if (action === 'messages') {
    const studentEmail = (url.searchParams.get('studentEmail') || '').trim().toLowerCase()
    const mentorEmail = (url.searchParams.get('mentorEmail') || '').trim().toLowerCase()
    if (!studentEmail || !mentorEmail) {
      return NextResponse.json({ error: 'Missing studentEmail or mentorEmail' }, { status: 400 })
    }

    const messages = await getCollection('mentor_messages')
    const docs = await messages
      .find({ studentEmail, mentorEmail })
      .sort({ createdAt: 1 })
      .toArray()

    return NextResponse.json({
      messages: docs.map(d => ({
        id: String(d._id),
        studentEmail: d.studentEmail,
        mentorEmail: d.mentorEmail,
        senderEmail: d.senderEmail,
        senderType: d.senderType,
        text: d.text,
        createdAt: d.createdAt,
      })),
    })
  }

  if (action === 'request-statuses') {
    const studentEmail = (url.searchParams.get('studentEmail') || '').trim().toLowerCase()
    if (!studentEmail) {
      return NextResponse.json({ error: 'Missing studentEmail' }, { status: 400 })
    }

    const requests = await getCollection('mentorship_requests')
    const docs = await requests.find({ studentEmail }).toArray()
    return NextResponse.json({
      statuses: docs.map(d => ({
        mentorEmail: d.mentorEmail,
        status: d.status,
      })),
    })
  }

  if (action === 'mentor-requests') {
    const mentorEmail = (url.searchParams.get('mentorEmail') || '').trim().toLowerCase()
    const status = (url.searchParams.get('status') || 'pending').trim().toLowerCase()
    if (!mentorEmail) {
      return NextResponse.json({ error: 'Missing mentorEmail' }, { status: 400 })
    }

    const requests = await getCollection('mentorship_requests')
    const users = await getCollection('users')
    const docs = await requests
      .find({ mentorEmail, status })
      .sort({ updatedAt: -1 })
      .toArray()

    const studentEmails = docs.map(d => String(d.studentEmail || '').toLowerCase()).filter(Boolean)
    const studentDocs = await users
      .find({ email: { $in: studentEmails }, type: 'student' })
      .project({ email: 1, name: 1, mbti: 1 })
      .toArray()
    const studentMap = new Map(studentDocs.map(s => [String(s.email || '').toLowerCase(), s]))

    return NextResponse.json({
      requests: docs.map(d => {
        const student = studentMap.get(String(d.studentEmail || '').toLowerCase())
        return {
          id: String(d._id),
          studentEmail: d.studentEmail,
          studentName: student?.name || '',
          studentMbti: student?.mbti || '',
          mentorEmail: d.mentorEmail,
          status: d.status,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        }
      }),
    })
  }

  if (action === 'mentor-conversations') {
    const mentorEmail = (url.searchParams.get('mentorEmail') || '').trim().toLowerCase()
    if (!mentorEmail) {
      return NextResponse.json({ error: 'Missing mentorEmail' }, { status: 400 })
    }

    const messages = await getCollection('mentor_messages')
    const requests = await getCollection('mentorship_requests')
    const users = await getCollection('users')
    const acceptedDocs = await requests.find({ mentorEmail, status: 'accepted' }).toArray()
    const acceptedStudents = acceptedDocs.map(d => String(d.studentEmail || '').toLowerCase())
    if (acceptedStudents.length === 0) {
      return NextResponse.json({ conversations: [] })
    }
    const docs = await messages
      .aggregate([
        { $match: { mentorEmail, studentEmail: { $in: acceptedStudents } } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$studentEmail',
            studentEmail: { $first: '$studentEmail' },
            lastMessage: { $first: '$text' },
            lastMessageAt: { $first: '$createdAt' },
          },
        },
        { $sort: { lastMessageAt: -1 } },
      ])
      .toArray()

    // Include accepted students even if they have no messages yet
    const docsByStudent = new Map(
      docs.map(d => [String(d.studentEmail || '').toLowerCase(), d])
    )
    const merged = acceptedStudents.map(studentEmail => {
      const fromMessages = docsByStudent.get(studentEmail)
      return {
        studentEmail,
        lastMessage: fromMessages?.lastMessage || '',
        lastMessageAt: fromMessages?.lastMessageAt || null,
      }
    })

    const studentEmails = merged.map(d => String(d.studentEmail || '').toLowerCase()).filter(Boolean)
    const studentDocs = await users
      .find({ email: { $in: studentEmails }, type: 'student' })
      .project({ email: 1, mbti: 1, name: 1 })
      .toArray()
    const studentMap = new Map(
      studentDocs.map(s => [String(s.email || '').toLowerCase(), { mbti: s.mbti || '', name: s.name || '' }])
    )

    return NextResponse.json({
      conversations: merged.map(d => ({
        studentEmail: d.studentEmail,
        studentName: studentMap.get(String(d.studentEmail || '').toLowerCase())?.name || '',
        studentMbti: studentMap.get(String(d.studentEmail || '').toLowerCase())?.mbti || '',
        lastMessage: d.lastMessage || '',
        lastMessageAt: d.lastMessageAt || null,
      })),
    })
  }

  if (action === 'student-notifications') {
    const studentEmail = (url.searchParams.get('studentEmail') || '').trim().toLowerCase()
    if (!studentEmail) {
      return NextResponse.json({ error: 'Missing studentEmail' }, { status: 400 })
    }

    const messages = await getCollection('mentor_messages')
    const docs = await messages
      .find({ studentEmail, senderType: 'mentor' })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()

    return NextResponse.json({
      notifications: docs.map(d => ({
        id: String(d._id),
        mentorEmail: d.mentorEmail,
        senderEmail: d.senderEmail,
        text: d.text,
        createdAt: d.createdAt,
      })),
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const action = body?.action

  if (action === 'send-request') {
    const studentEmail = String(body?.studentEmail || '').trim().toLowerCase()
    const mentorEmail = String(body?.mentorEmail || '').trim().toLowerCase()
    if (!studentEmail || !mentorEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const requests = await getCollection('mentorship_requests')
    const now = new Date()
    const existing = await requests.findOne({ studentEmail, mentorEmail })
    if (existing?.status === 'accepted') {
      return NextResponse.json({ success: true, status: 'accepted' })
    }

    const requestDoc: MentorshipRequest = {
      studentEmail,
      mentorEmail,
      status: 'pending',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }

    await requests.updateOne(
      { studentEmail, mentorEmail },
      { $set: requestDoc },
      { upsert: true }
    )
    return NextResponse.json({ success: true, status: 'pending' })
  }

  if (action === 'respond-request') {
    const studentEmail = String(body?.studentEmail || '').trim().toLowerCase()
    const mentorEmail = String(body?.mentorEmail || '').trim().toLowerCase()
    const decision = String(body?.decision || '').trim().toLowerCase()
    if (!studentEmail || !mentorEmail || !['accepted', 'rejected'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid request response payload' }, { status: 400 })
    }

    const requests = await getCollection('mentorship_requests')
    await requests.updateOne(
      { studentEmail, mentorEmail },
      { $set: { status: decision, updatedAt: new Date() } }
    )
    return NextResponse.json({ success: true, status: decision })
  }

  if (action !== 'send-message') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const studentEmail = String(body?.studentEmail || '').trim().toLowerCase()
  const mentorEmail = String(body?.mentorEmail || '').trim().toLowerCase()
  const senderEmail = String(body?.senderEmail || '').trim().toLowerCase()
  const senderType = body?.senderType === 'mentor' ? 'mentor' : 'student'
  const text = String(body?.text || '').trim()

  if (!studentEmail || !mentorEmail || !senderEmail || !text) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (text.length > 1000) {
    return NextResponse.json({ error: 'Message too long (max 1000 chars)' }, { status: 400 })
  }

  // Chat is allowed only after mentorship request is accepted.
  const requests = await getCollection('mentorship_requests')
  const relation = await requests.findOne({ studentEmail, mentorEmail })
  if (!relation || relation.status !== 'accepted') {
    return NextResponse.json({ error: 'Connection not accepted yet' }, { status: 403 })
  }

  const message: ChatMessage = {
    studentEmail,
    mentorEmail,
    senderEmail,
    senderType,
    text,
    createdAt: new Date(),
  }

  const messages = await getCollection('mentor_messages')
  const result = await messages.insertOne(message)

  return NextResponse.json({
    success: true,
    message: {
      id: String(result.insertedId),
      ...message,
    },
  })
}
