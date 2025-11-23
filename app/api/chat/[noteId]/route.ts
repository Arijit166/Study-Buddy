import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import NoteVector from '@/models/NoteVector'
import ChatSession from '@/models/ChatSession'
import Groq from 'groq-sdk'
import { getCurrentUser } from '@/lib/auth'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { noteId } = await params
    const { message } = await req.json()

    await connectDB()

    const noteVector = await NoteVector.findOne({
      noteId: noteId,
      userId: user.userId,
    })

    if (!noteVector) {
      return NextResponse.json({ error: 'Note not processed yet' }, { status: 404 })
    }

    let chatSession = await ChatSession.findOne({
      noteId: noteId,
      userId: user.userId,
    })

    if (!chatSession) {
      chatSession = await ChatSession.create({
        noteId: noteId,
        userId: user.userId,
        messages: [],
      })
    }

    const keywords = message.toLowerCase().split(' ').filter((w: string) => w.length > 3)
    const contextChunks = noteVector.extractedText
      .split('\n\n')
      .filter((chunk: string) => 
        keywords.some((keyword: string) => chunk.toLowerCase().includes(keyword))
      )
      .slice(0, 3)
      .join('\n\n')

    const relevantContext = contextChunks || noteVector.extractedText.slice(0, 2000)

    const conversationHistory = chatSession.messages.slice(-6).map(msg => ({
      role: msg.role,
      content: msg.content,
    }))

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a helpful tutor assistant. Use the following context from the student's notes to answer their questions. Be clear, educational, and encouraging.

Context from notes:
${relevantContext}

If the question is not covered in the context, say so and provide general educational guidance.`,
        },
        ...conversationHistory,
        {
          role: 'user',
          content: message,
        },
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    })

    const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'

    chatSession.messages.push(
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: assistantMessage, timestamp: new Date() }
    )
    chatSession.updatedAt = new Date()
    await chatSession.save()

    return NextResponse.json({ 
      message: assistantMessage,
      sessionId: chatSession._id,
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 })
  }
}

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

    const chatSession = await ChatSession.findOne({
      noteId: noteId,
      userId: user.userId,
    })

    return NextResponse.json({ 
      messages: chatSession?.messages || [],
      noteId: noteId,
    })

  } catch (error) {
    console.error('Get chat error:', error)
    return NextResponse.json({ error: 'Failed to get chat history' }, { status: 500 })
  }
}