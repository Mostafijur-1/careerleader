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
  try {
    const featuredCollection = await getCollection('featured_contents')
    const admin = getAdminUser(req)
    
    let list
    if (admin) {
      list = await featuredCollection.find({}).toArray()
    } else {
      list = await featuredCollection.find({ active: true }).toArray()
    }

    const mapped = list.map(item => ({
      id: String(item._id),
      title: item.title || '',
      description: item.description || '',
      badge: item.badge || '',
      link: item.link || '',
      linkText: item.linkText || '',
      active: item.active ?? false,
    }))

    return NextResponse.json({ featured: mapped })
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
    const { action, id, title, description, badge, link, linkText, active } = body

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    const featuredCollection = await getCollection('featured_contents')

    if (action === 'create') {
      if (!title || !description) {
        return NextResponse.json({ error: 'Missing title or description' }, { status: 400 })
      }
      const result = await featuredCollection.insertOne({
        title,
        description,
        badge: badge || '',
        link: link || '',
        linkText: linkText || '',
        active: active ?? true,
        createdAt: new Date(),
      })
      return NextResponse.json({ success: true, id: String(result.insertedId) })
    }

    if (action === 'update') {
      if (!id) {
        return NextResponse.json({ error: 'Missing ID for update' }, { status: 400 })
      }
      const oid = new ObjectId(id)
      const updateDoc: Record<string, string | boolean> = {}
      if (typeof title === 'string') updateDoc.title = title
      if (typeof description === 'string') updateDoc.description = description
      if (typeof badge === 'string') updateDoc.badge = badge
      if (typeof link === 'string') updateDoc.link = link
      if (typeof linkText === 'string') updateDoc.linkText = linkText
      if (typeof active === 'boolean') updateDoc.active = active

      await featuredCollection.updateOne({ _id: oid }, { $set: updateDoc })
      return NextResponse.json({ success: true })
    }

    if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ error: 'Missing ID for deletion' }, { status: 400 })
      }
      await featuredCollection.deleteOne({ _id: new ObjectId(id) })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
