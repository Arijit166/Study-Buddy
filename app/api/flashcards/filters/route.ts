import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FlashcardDeck from "@/models/Flashcard";

export async function GET() {
  try {
    await connectDB();

    const subjects = await FlashcardDeck.distinct("subject");
    const categories = await FlashcardDeck.distinct("category");

    return NextResponse.json({
      subjects: subjects.sort(),
      categories: categories.sort(),
    });
  } catch (error) {
    console.error("Fetch filters error:", error);
    return NextResponse.json(
      { error: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}