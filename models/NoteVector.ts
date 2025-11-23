import mongoose, { Document, Model } from "mongoose";

export interface INoteVector extends Document {
  noteId: string;
  userId: string;
  extractedText: string;
  topics: string[];
  suggestedQuestions: string[];
  createdAt: Date;
}

let NoteVector: Model<INoteVector>;

if (mongoose.models.NoteVector) {
  NoteVector = mongoose.models.NoteVector as Model<INoteVector>;
} else {
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
    topics: [{
      type: String,
    }],
    suggestedQuestions: [{
      type: String,
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  NoteVector = mongoose.model<INoteVector>("NoteVector", NoteVectorSchema);
}

export default NoteVector;