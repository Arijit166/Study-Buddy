import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Note from '@/models/Note'
import NoteVector from '@/models/NoteVector'
import Groq from 'groq-sdk'
import { getCurrentUser } from '@/lib/auth'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const pdf = require('pdf-parse')
  const data = await pdf(buffer)
  return data.text
}

export async function POST(
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

    const existing = await NoteVector.findOne({ noteId: id })
    if (existing) {
      return NextResponse.json({ 
        message: 'Already processed',
        data: existing 
      })
    }

    let extractedText = ''
    if (note.fileType.includes('pdf')) {
      try {
        extractedText = await parsePdfBuffer(note.fileData)
      } catch (pdfError) {
        console.error('PDF parse error:', pdfError)
        return NextResponse.json({ 
          error: 'Failed to extract PDF text. Please ensure the PDF is readable.' 
        }, { status: 400 })
      }
    } else {
      extractedText = note.fileData.toString('utf-8')
    }

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json({ 
        error: 'Could not extract sufficient text from the document' 
      }, { status: 400 })
    }

    const topicsResponse = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an educational assistant. Extract 5-8 main topics from the given text. Return only a JSON array of topic strings, nothing else.',
        },
        {
          role: 'user',
          content: `Extract main topics from this text:\n\n${extractedText.slice(0, 4000)}`,
        },
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.3,
      max_tokens: 500,
    })

    let topics: string[] = []
    try {
      topics = JSON.parse(topicsResponse.choices[0]?.message?.content || '[]')
    } catch {
      topics = ['General Content']
    }

    const questionsResponse = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an educational assistant. Generate 5 study questions based on the content. Return only a JSON array of question strings, nothing else.',
        },
        {
          role: 'user',
          content: `Generate study questions from this text:\n\n${extractedText.slice(0, 4000)}`,
        },
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.5,
      max_tokens: 500,
    })

    let suggestedQuestions: string[] = []
    try {
      suggestedQuestions = JSON.parse(questionsResponse.choices[0]?.message?.content || '[]')
    } catch {
      suggestedQuestions = ['What are the main concepts?', 'Can you summarize this?']
    }

    const noteVector = await NoteVector.create({
      noteId: id,
      userId: user.userId,
      extractedText,
      topics,
      suggestedQuestions,
    })

    return NextResponse.json({ 
      message: 'Processing complete',
      data: noteVector 
    })

  } catch (error) {
    console.error('Process error:', error)
    return NextResponse.json({ 
      error: 'Failed to process note',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}