import { NextResponse } from 'next/server'
import { getCollection } from '../../../lib/db'

type ChatMessage = {
  studentEmail: string
  mentorEmail: string
  senderEmail: string
  senderType: 'student' | 'mentor'
  text: string
  createdAt: Date
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (action === 'mentors') {
    const users = await getCollection('users')
    const mentors = await users.find({ type: 'mentor', active: true }).toArray()
    return NextResponse.json({
      mentors: mentors.map(m => ({
        id: String(m._id),
        email: m.email,
        name: m.name,
        expertise: m.expertise || [],
        active: m.active || false,
        zoomLink: m.zoomLink || '',
        meetLink: m.meetLink || '',
      })),
    })
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

  if (action === 'mentor-conversations') {
    const mentorEmail = (url.searchParams.get('mentorEmail') || '').trim().toLowerCase()
    if (!mentorEmail) {
      return NextResponse.json({ error: 'Missing mentorEmail' }, { status: 400 })
    }

    const messages = await getCollection('mentor_messages')
    const users = await getCollection('users')
    const docs = await messages
      .aggregate([
        { $match: { mentorEmail } },
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

    const studentEmails = docs.map(d => String(d.studentEmail || '').toLowerCase()).filter(Boolean)
    const studentDocs = await users
      .find({ email: { $in: studentEmails }, type: 'student' })
      .project({ email: 1, mbti: 1, name: 1 })
      .toArray()
    const studentMap = new Map(
      studentDocs.map(s => [String(s.email || '').toLowerCase(), { mbti: s.mbti || '', name: s.name || '' }])
    )

    return NextResponse.json({
      conversations: docs.map(d => ({
        studentEmail: d.studentEmail,
        studentName: studentMap.get(String(d.studentEmail || '').toLowerCase())?.name || '',
        studentMbti: studentMap.get(String(d.studentEmail || '').toLowerCase())?.mbti || '',
        lastMessage: d.lastMessage || '',
        lastMessageAt: d.lastMessageAt || null,
      })),
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const action = body?.action

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
