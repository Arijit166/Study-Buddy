import mongoose, { Document, Model } from "mongoose"

interface IChunk {
  content: string
  embedding: number[]
  index: number
  tokens: number
}

export interface INoteVector extends Document {
  noteId: string
  userId: string
  extractedText: string
  chunks: IChunk[]
  topics: string[]
  suggestedQuestions: string[]
  ocrConfidence?: number
  pageCount?: number
  createdAt: Date
}

let NoteVector: Model<INoteVector>

if (mongoose.models.NoteVector) {
  NoteVector = mongoose.models.NoteVector as Model<INoteVector>
} else {
  const ChunkSchema = new mongoose.Schema({
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    tokens: {
      type: Number,
      required: true,
    },
  })

  const NoteVectorSchema = new mongoose.Schema<INoteVector>({
    noteId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    chunks: [ChunkSchema],
    topics: [{
      type: String,
    }],
    suggestedQuestions: [{
      type: String,
    }],
    ocrConfidence: {
      type: Number,
    },
    pageCount: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  })

  // Add index for better query performance
  NoteVectorSchema.index({ userId: 1, noteId: 1 })

  NoteVector = mongoose.model<INoteVector>("NoteVector", NoteVectorSchema)
}

export default NoteVector