import mongoose, { Document, Model } from "mongoose";

interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  noteId: string;
  userId: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

let ChatSession: Model<IChatSession>;

if (mongoose.models.ChatSession) {
  ChatSession = mongoose.models.ChatSession as Model<IChatSession>;
} else {
  const ChatSessionSchema = new mongoose.Schema<IChatSession>({
    noteId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [{
      role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
  }, { 
    timestamps: true
  });
  ChatSession = mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
}

export default ChatSession;