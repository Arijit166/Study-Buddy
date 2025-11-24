import mongoose, { Document, Model } from "mongoose";

export interface ICard {
  question: string;
  answer: string;
}

export interface IFlashcardDeck extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  category: string;
  cards: ICard[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

let FlashcardDeck: Model<IFlashcardDeck>;

if (mongoose.models.FlashcardDeck) {
  FlashcardDeck = mongoose.models.FlashcardDeck as Model<IFlashcardDeck>;
} else {
  const CardSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
  });

  const FlashcardDeckSchema = new mongoose.Schema<IFlashcardDeck>(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      subject: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
      cards: {
        type: [CardSchema],
        default: [],
      },
      isPublic: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

  FlashcardDeck = mongoose.model<IFlashcardDeck>("FlashcardDeck", FlashcardDeckSchema);
}

export default FlashcardDeck;