import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import NoteVector from '@/models/NoteVector'
import ChatSession from '@/models/ChatSession'
import Groq from 'groq-sdk'
import { getCurrentUser } from '@/lib/auth'
import { generateEmbedding, findSimilarChunks } from '@/lib/embeddings'

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

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    await connectDB()

    // Find the processed note with embeddings
    const noteVector = await NoteVector.findOne({
      noteId: noteId,
      userId: user.userId,
    })

    if (!noteVector) {
      return NextResponse.json({ 
        error: 'Note not processed yet. Please wait for processing to complete.' 
      }, { status: 404 })
    }

    // Find or create chat session
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

    console.log('Generating query embedding...')
    
    // Generate embedding for user's query
    const { vector: queryEmbedding } = await generateEmbedding(message)

    // Find most relevant chunks using semantic search
    const relevantChunks = findSimilarChunks(
      queryEmbedding,
      noteVector.chunks,
      3 // Top 3 most relevant chunks
    )

    console.log('Found relevant chunks:', relevantChunks.map(c => ({
      index: c.index,
      similarity: c.similarity.toFixed(3),
      preview: c.content.slice(0, 100) + '...'
    })))

    // Build context from relevant chunks
    const relevantContext = relevantChunks
      .map((chunk, idx) => `[Chunk ${idx + 1}, Relevance: ${(chunk.similarity * 100).toFixed(1)}%]\n${chunk.content}`)
      .join('\n\n---\n\n')

    // Get recent conversation history
    const conversationHistory = chatSession.messages.slice(-6).map(msg => ({
      role: msg.role,
      content: msg.content,
    }))

    console.log('Sending request to Groq...')

    // Generate response using Groq with RAG context
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert study tutor helping students understand their course material. You have access to the student's notes and should provide clear, educational responses.

**RELEVANT CONTEXT FROM NOTES:**
${relevantContext}

**YOUR ROLE:**
- Answer questions based primarily on the provided context chunks above
- If the answer is clearly in the context, explain it thoroughly with examples
- If the context doesn't contain the answer, acknowledge this honestly and provide general educational guidance
- Break down complex concepts into simpler terms
- Use analogies and real-world examples when helpful
- Be encouraging and supportive
- Show your reasoning step-by-step for problem-solving

**RESPONSE GUIDELINES:**
- Keep responses concise but thorough (2-4 paragraphs)
- Use markdown formatting for better readability
- If referring to specific information, mention it's from the notes
- For math or technical content, show your work
- If asked to summarize, create a well-structured overview

Remember: Your goal is to help the student learn and understand, not just provide answers.`
        },
        ...conversationHistory,
        {
          role: 'user',
          content: message,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 0.9,
    })

    const assistantMessage = completion.choices[0]?.message?.content || 
      'I apologize, but I encountered an issue generating a response. Please try rephrasing your question.'

    console.log('Response generated successfully')

    // Save messages to chat history
    chatSession.messages.push(
      { 
        role: 'user', 
        content: message, 
        timestamp: new Date() 
      },
      { 
        role: 'assistant', 
        content: assistantMessage, 
        timestamp: new Date() 
      }
    )
    chatSession.updatedAt = new Date()
    await chatSession.save()

    return NextResponse.json({ 
      message: assistantMessage,
      sessionId: chatSession._id,
      relevance: relevantChunks.map(c => c.similarity)
    })

  } catch (error) {
    console.error('Chat error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json({ 
          error: 'Configuration error. Please check API settings.' 
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to process your message. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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
      hasHistory: chatSession ? chatSession.messages.length > 0 : false,
    })

  } catch (error) {
    console.error('Get chat error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve chat history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}