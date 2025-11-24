import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FlashcardDeck from "@/models/Flashcard";
import StudyProgress from "@/models/StudyProgress";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    const { id } = params;

    const deck = await FlashcardDeck.findById(id).lean();

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    let progress = null;
    if (user) {
      progress = await StudyProgress.findOne({
        userId: user.userId,
        deckId: id,
      }).lean();
    }

    return NextResponse.json({
      deck: {
        ...deck,
        cardCount: deck.cards.length,
        progress: progress?.progressPercentage || 0,
        correctCards: progress?.correctCards || [],
      },
    });
  } catch (error) {
    console.error("Fetch deck error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deck" },
      { status: 500 }
    );
  }
}