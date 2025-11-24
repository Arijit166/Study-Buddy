import mongoose, { Document, Model } from "mongoose";

export interface IQuizQuestion extends Document {
  question: string;
  type: 'mcq' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface IQuiz extends Document {
  userId: mongoose.Types.ObjectId;
  topic: string;
  sourceType: 'note' | 'flashcard' | 'ai-generated';
  sourceId?: mongoose.Types.ObjectId;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  questions: IQuizQuestion[];
  score?: number;
  totalQuestions?: number;
  completedAt?: Date;
  createdAt: Date;
}

let Quiz: Model<IQuiz>;

if (mongoose.models.Quiz) {
  Quiz = mongoose.models.Quiz as Model<IQuiz>;
} else {
  const QuizQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['mcq', 'true-false', 'short-answer'],
      required: true 
    },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    userAnswer: { type: String },
    isCorrect: { type: Boolean },
  });

  const QuizSchema = new mongoose.Schema<IQuiz>({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
    },
    sourceType: {
      type: String,
      enum: ['note', 'flashcard', 'ai-generated'],
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    questionCount: {
      type: Number,
      required: true,
    },
    questions: [QuizQuestionSchema],
    score: { type: Number },
    totalQuestions: { type: Number },
    completedAt: { type: Date },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  Quiz = mongoose.model<IQuiz>("Quiz", QuizSchema);
}

export default Quiz;