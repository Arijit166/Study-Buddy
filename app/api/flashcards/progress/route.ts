import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StudyProgress from "@/models/StudyProgress";
import FlashcardDeck from "@/models/Flashcard";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deckId, correctCards } = await req.json();

    const deck = await FlashcardDeck.findById(deckId);
    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const totalCards = deck.cards.length;
    const progressPercentage = Math.round(
      (correctCards.length / totalCards) * 100
    );

    const progress = await StudyProgress.findOneAndUpdate(
      { userId: user.userId, deckId },
      {
        correctCards,
        totalCards,
        progressPercentage,
        lastStudied: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Update progress error:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}