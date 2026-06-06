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
    const adsCollection = await getCollection('ads')
    const admin = getAdminUser(req)
    
    let list
    if (admin) {
      list = await adsCollection.find({}).toArray()
    } else {
      list = await adsCollection.find({ active: true }).toArray()
    }

    const mapped = list.map(item => ({
      id: String(item._id),
      title: item.title || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      link: item.link || '',
      active: item.active ?? false,
    }))

    return NextResponse.json({ ads: mapped })
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
    const { action, id, title, description, imageUrl, link, active } = body

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    const adsCollection = await getCollection('ads')

    if (action === 'create') {
      if (!title || !description) {
        return NextResponse.json({ error: 'Missing title or description' }, { status: 400 })
      }
      const result = await adsCollection.insertOne({
        title,
        description,
        imageUrl: imageUrl || '',
        link: link || '',
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
      if (typeof imageUrl === 'string') updateDoc.imageUrl = imageUrl
      if (typeof link === 'string') updateDoc.link = link
      if (typeof active === 'boolean') updateDoc.active = active

      await adsCollection.updateOne({ _id: oid }, { $set: updateDoc })
      return NextResponse.json({ success: true })
    }

    if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ error: 'Missing ID for deletion' }, { status: 400 })
      }
      await adsCollection.deleteOne({ _id: new ObjectId(id) })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
