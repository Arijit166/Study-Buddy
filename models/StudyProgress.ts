import mongoose, { Document, Model } from "mongoose";

export interface IStudyProgress extends Document {
  userId: mongoose.Types.ObjectId;
  deckId: mongoose.Types.ObjectId;
  correctCards: number[];
  totalCards: number;
  lastStudied: Date;
  progressPercentage: number;
}

let StudyProgress: Model<IStudyProgress>;

if (mongoose.models.StudyProgress) {
  StudyProgress = mongoose.models.StudyProgress as Model<IStudyProgress>;
} else {
  const StudyProgressSchema = new mongoose.Schema<IStudyProgress>(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      deckId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FlashcardDeck",
        required: true,
      },
      correctCards: {
        type: [Number],
        default: [],
      },
      totalCards: {
        type: Number,
        default: 0,
      },
      lastStudied: {
        type: Date,
        default: Date.now,
      },
      progressPercentage: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

  StudyProgressSchema.index({ userId: 1, deckId: 1 }, { unique: true });

  StudyProgress = mongoose.model<IStudyProgress>("StudyProgress", StudyProgressSchema);
}

export default StudyProgress;