import mongoose, { Document, Model } from "mongoose";

export interface INote extends Document {
  userId: string;
  name: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: Buffer;
  createdAt: Date;
}

let Note: Model<INote>;

if (mongoose.models.Note) {
  Note = mongoose.models.Note as Model<INote>;
} else {
  const NoteSchema = new mongoose.Schema<INote>({
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileData: {
      type: Buffer,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  Note = mongoose.model<INote>("Note", NoteSchema);
}

export default Note;