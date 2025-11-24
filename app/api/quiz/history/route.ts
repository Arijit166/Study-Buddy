import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Quiz from "@/models/Quiz";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const quizzes = await Quiz.find({
      userId: user.userId,
      completedAt: { $exists: true },
    })
      .sort({ completedAt: -1 })
      .limit(20)
      .select("topic score totalQuestions difficulty completedAt sourceType");

    return NextResponse.json({
      quizzes: quizzes.map((quiz) => ({
        id: quiz._id.toString(),
        topic: quiz.topic,
        score: quiz.score,
        totalQuestions: quiz.totalQuestions,
        difficulty: quiz.difficulty,
        completedAt: quiz.completedAt,
        sourceType: quiz.sourceType,
      })),
    });
  } catch (error) {
    console.error("Quiz history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz history" },
      { status: 500 }
    );
  }
}