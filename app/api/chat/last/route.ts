import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ChatSession from '@/models/ChatSession'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const lastChat = await ChatSession.findOne({
      userId: user.userId,
    }).sort({ updatedAt: -1 })

    if (!lastChat) {
      return NextResponse.json({ noteId: null })
    }

    return NextResponse.json({ noteId: lastChat.noteId })

  } catch (error) {
    console.error('Get last chat error:', error)
    return NextResponse.json({ error: 'Failed to get last chat' }, { status: 500 })
  }
}