import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Note from '@/models/Note'
import NoteVector from '@/models/NoteVector'
import { getCurrentUser } from '@/lib/auth'
import { extractText } from '@/lib/ocr'
import { chunkText, extractTopics } from '@/lib/textChunker'
import { generateEmbedding } from '@/lib/embeddings'
import { generateStudyQuestions } from '@/lib/questionGenerator'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: noteId } = await params

    await connectDB()

    // Check if already processed
    const existingVector = await NoteVector.findOne({
      noteId: noteId,
      userId: user.userId,
    })

    if (existingVector) {
      return NextResponse.json({ 
        message: 'Note already processed',
        data: {
          topics: existingVector.topics,
          suggestedQuestions: existingVector.suggestedQuestions
        }
      })
    }

    // Get the note
    const note = await Note.findOne({
      _id: noteId,
      userId: user.userId,
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    console.log('Starting OCR extraction...')

    // Step 1: Extract text using OCR
    const fileBuffer = typeof note.fileData === 'string' 
      ? Buffer.from(note.fileData, 'base64')
      : Buffer.from((note.fileData as any).data || note.fileData)
    const { text: extractedText, confidence, pages } = await extractText(
      fileBuffer,
      note.fileType
    )

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json({ 
        error: 'Could not extract sufficient text from the document. Please ensure the file contains readable text or clear images.' 
      }, { status: 400 })
    }

    console.log(`Text extracted: ${extractedText.length} characters from ${pages} page(s)`)
    console.log(`OCR Confidence: ${confidence.toFixed(2)}%`)

    // Step 2: Chunk the text
    console.log('Chunking text...')
    const chunks = chunkText(extractedText, 500, 50)
    console.log(`Created ${chunks.length} chunks`)

    // Step 3: Generate embeddings for each chunk
    console.log('Generating embeddings...')
    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const { vector } = await generateEmbedding(chunk.content)
        return {
          content: chunk.content,
          embedding: vector,
          index: chunk.index,
          tokens: chunk.tokens
        }
      })
    )

    // Step 4: Extract topics
    console.log('Extracting topics...')
    const topics = extractTopics(extractedText, 6)

    // Step 5: Generate study questions
    console.log('Generating study questions...')
    const suggestedQuestions = await generateStudyQuestions(extractedText, 6)

    // Step 6: Save to database
    console.log('Saving to database...')
    const noteVector = await NoteVector.create({
      noteId: noteId,
      userId: user.userId,
      extractedText: extractedText,
      chunks: chunksWithEmbeddings,
      topics: topics,
      suggestedQuestions: suggestedQuestions,
      ocrConfidence: confidence,
      pageCount: pages,
    })

    console.log('Processing complete!')

    return NextResponse.json({ 
      message: 'Note processed successfully',
      data: {
        topics: noteVector.topics,
        suggestedQuestions: noteVector.suggestedQuestions,
        confidence: confidence,
        pages: pages,
        chunks: chunks.length
      }
    })

  } catch (error) {
    console.error('Process note error:', error)
    return NextResponse.json({ 
      error: 'Failed to process note',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}