import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import Note from "@/models/Note";
import FlashcardDeck from "@/models/Flashcard";

// Python microservice URL
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

async function extractTextFromNote(noteId: string, userId: string) {
  await connectDB();
  const note = await Note.findOne({ _id: noteId, userId });
  
  if (!note) {
    throw new Error("Note not found");
  }

  // Call Python service for text extraction
  const base64File = note.fileData.toString("base64");
  
  const response = await fetch(`${PYTHON_SERVICE_URL}/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file: base64File,
      mimeType: note.fileType,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to extract text from note");
  }

  const data = await response.json();
  return data.text;
}

async function getFlashcardContent(deckId: string, userId: string) {
  await connectDB();
  const deck = await FlashcardDeck.findOne({ _id: deckId, userId });
  
  if (!deck) {
    throw new Error("Flashcard deck not found");
  }

  // Convert flashcards to text format
  return deck.cards
    .map((card) => `Q: ${card.question}\nA: ${card.answer}`)
    .join("\n\n");
}

async function generateQuizWithRAG(
  content: string,
  topic: string,
  questionCount: number,
  difficulty: string,
  questionTypes: string[]
) {
  // Call Python service for RAG-based quiz generation
  const response = await fetch(`${PYTHON_SERVICE_URL}/generate-quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      topic,
      questionCount,
      difficulty,
      questionTypes,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate quiz");
  }

  return await response.json();
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      topic,
      sourceType,
      sourceId,
      questionCount,
      difficulty,
      questionTypes,
      customNotes,
    } = body;

    let content = "";
    let actualSourceType: "note" | "flashcard" | "ai-generated" = "ai-generated";
    let actualSourceId = undefined;

    // Get content based on source
    if (sourceType === "note" && sourceId) {
      content = await extractTextFromNote(sourceId, user.userId);
      actualSourceType = "note";
      actualSourceId = sourceId;
    } else if (sourceType === "flashcard" && sourceId) {
      content = await getFlashcardContent(sourceId, user.userId);
      actualSourceType = "flashcard";
      actualSourceId = sourceId;
    } else {
      // AI-generated topic
      content = `Generate questions about: ${topic}. ${customNotes || ""}`;
    }

    // Generate quiz using RAG
    const quizData = await generateQuizWithRAG(
      content,
      topic,
      questionCount,
      difficulty,
      questionTypes
    );

    // Save quiz to database
    await connectDB();
    const quiz = await Quiz.create({
      userId: user.userId,
      topic,
      sourceType: actualSourceType,
      sourceId: actualSourceId,
      difficulty,
      questionCount,
      questions: quizData.questions,
    });

    return NextResponse.json({
      quizId: quiz._id.toString(),
      questions: quiz.questions,
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate quiz" },
      { status: 500 }
    );
  }
}