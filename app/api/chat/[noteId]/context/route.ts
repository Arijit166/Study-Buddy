import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Note from '@/models/Note'
import NoteVector from '@/models/NoteVector'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { noteId } = await params

    await connectDB()

    const note = await Note.findOne({
      _id: noteId,
      userId: user.userId,
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const noteVector = await NoteVector.findOne({
      noteId: noteId,
      userId: user.userId,
    })

    return NextResponse.json({
      note: {
        _id: note._id,
        name: note.name,
        fileName: note.fileName,
      },
      topics: noteVector?.topics || [],
      suggestedQuestions: noteVector?.suggestedQuestions || [],
      isProcessed: !!noteVector,
    })

  } catch (error) {
    console.error('Get context error:', error)
    return NextResponse.json({ 
      error: 'Failed to get context',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}