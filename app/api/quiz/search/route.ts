import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import FlashcardDeck from "@/models/Flashcard";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchQuery = req.nextUrl.searchParams.get("q") || "";

    await connectDB();

    // Search in notes
    const notes = await Note.find({
      userId: user.userId,
      name: { $regex: searchQuery, $options: "i" },
    })
      .select("_id name fileType")
      .limit(10);

    // Search in flashcard decks
    const flashcards = await FlashcardDeck.find({
      userId: user.userId,
      name: { $regex: searchQuery, $options: "i" },
    })
      .select("_id name subject")
      .limit(10);

    const results = [
      ...notes.map((note) => ({
        id: note._id.toString(),
        name: note.name,
        type: "note" as const,
        fileType: note.fileType,
      })),
      ...flashcards.map((deck) => ({
        id: deck._id.toString(),
        name: deck.name,
        type: "flashcard" as const,
        subject: deck.subject,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search topics" },
      { status: 500 }
    );
  }
}