import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FlashcardDeck from "@/models/Flashcard";
import StudyProgress from "@/models/StudyProgress";
import { getCurrentUser } from "@/lib/auth";

// Define a type for the response deck
interface DeckResponse {
  _id: string;
  userId: string;
  name: string;
  subject: string;
  category: string;
  cards: Array<{ question: string; answer: string }>;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  cardCount: number;
  progress: number;
}

// GET - Fetch decks with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const subject = searchParams.get("subject");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "6");
    const skip = parseInt(searchParams.get("skip") || "0");

    const query: any = { isPublic: true };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (subject) {
      query.subject = subject;
    }
    if (category) {
      query.category = category;
    }

    const decks = await FlashcardDeck.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await FlashcardDeck.countDocuments(query);

    // Get progress for user if logged in
    let decksWithProgress: DeckResponse[];
    
    if (user) {
      const progressData = await StudyProgress.find({
        userId: user.userId,
        deckId: { $in: decks.map((d) => d._id) },
      }).lean();

      const progressMap = new Map(
        progressData.map((p) => [p.deckId.toString(), p])
      );

      decksWithProgress = decks.map((deck) => {
        const progress = progressMap.get(deck._id.toString());
        return {
          _id: deck._id.toString(),
          userId: deck.userId.toString(),
          name: deck.name,
          subject: deck.subject,
          category: deck.category,
          cards: deck.cards,
          isPublic: deck.isPublic,
          createdAt: deck.createdAt.toISOString(),
          updatedAt: deck.updatedAt.toISOString(),
          cardCount: deck.cards.length,
          progress: progress?.progressPercentage || 0,
        };
      });
    } else {
      decksWithProgress = decks.map((deck) => ({
        _id: deck._id.toString(),
        userId: deck.userId.toString(),
        name: deck.name,
        subject: deck.subject,
        category: deck.category,
        cards: deck.cards,
        isPublic: deck.isPublic,
        createdAt: deck.createdAt.toISOString(),
        updatedAt: deck.updatedAt.toISOString(),
        cardCount: deck.cards.length,
        progress: 0,
      }));
    }

    return NextResponse.json({
      decks: decksWithProgress,
      total,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    console.error("Fetch decks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch decks" },
      { status: 500 }
    );
  }
}

// POST - Create new deck
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, subject, category, cards, isPublic } = await req.json();

    if (!name || !subject || !category || !cards || cards.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const deck = await FlashcardDeck.create({
      userId: user.userId,
      name,
      subject,
      category,
      cards,
      isPublic: isPublic !== false,
    });

    return NextResponse.json({ 
      deck: {
        _id: deck._id.toString(),
        userId: deck.userId.toString(),
        name: deck.name,
        subject: deck.subject,
        category: deck.category,
        cards: deck.cards,
        isPublic: deck.isPublic,
        createdAt: deck.createdAt.toISOString(),
        updatedAt: deck.updatedAt.toISOString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Create deck error:", error);
    return NextResponse.json(
      { error: "Failed to create deck" },
      { status: 500 }
    );
  }
}