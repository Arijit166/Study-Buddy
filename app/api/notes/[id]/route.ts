import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Note from '@/models/Note'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await connectDB()

    const note = await Note.findOne({
      _id: id,
      userId: user.userId,
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({
      fileData: note.fileData.toString('base64'),
      fileType: note.fileType,
    })

  } catch (error) {
    console.error('Get note error:', error)
    return NextResponse.json({ error: 'Failed to get note' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await connectDB()

    const note = await Note.findOneAndDelete({
      _id: id,
      userId: user.userId,
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Note deleted successfully' })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}