import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Quiz from "@/models/Quiz";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { answers } = await req.json();
    const resolvedParams = await params; 
    const { quizId } = resolvedParams;

    await connectDB();
    const quiz = await Quiz.findOne({ _id: quizId, userId: user.userId });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Grade the quiz
    let correctCount = 0;
    const gradedQuestions = quiz.questions.map((question, index) => {
      const userAnswer = answers[index]?.answer || "";
      let isCorrect = false;

      if (question.type === "mcq" || question.type === "true-false") {
        isCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
      } else if (question.type === "short-answer") {
        // For short answer, use fuzzy matching or exact match
        const cleanUserAnswer = userAnswer.toLowerCase().trim();
        const cleanCorrectAnswer = question.correctAnswer.toLowerCase().trim();
        isCorrect = cleanUserAnswer === cleanCorrectAnswer ||
                    cleanUserAnswer.includes(cleanCorrectAnswer) ||
                    cleanCorrectAnswer.includes(cleanUserAnswer);
      }

      if (isCorrect) correctCount++;

      return {
        ...question.toObject(),
        userAnswer,
        isCorrect,
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    // Update quiz with results
    quiz.questions = gradedQuestions;
    quiz.score = score;
    quiz.totalQuestions = quiz.questions.length;
    quiz.completedAt = new Date();
    await quiz.save();

    return NextResponse.json({
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      questions: gradedQuestions,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}