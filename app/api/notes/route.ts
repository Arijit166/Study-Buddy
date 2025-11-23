import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Note from '@/models/Note'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const notes = await Note.find({ 
      userId: user.userId 
    }).sort({ createdAt: -1 })

    return NextResponse.json({ notes }, { status: 200 })
  } catch (error) {
    console.error('Fetch notes error:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const name = formData.get('name') as string
    const file = formData.get('file') as File

    if (!name || !file) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    await connectDB()

    const note = await Note.create({
      userId: user.userId,
      name,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileData: buffer,
    })

    return NextResponse.json({ 
      message: 'Note uploaded successfully',
      note: {
        _id: note._id,
        name: note.name,
        fileName: note.fileName,
        fileType: note.fileType,
        fileSize: note.fileSize,
        createdAt: note.createdAt,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload note' }, { status: 500 })
  }
}