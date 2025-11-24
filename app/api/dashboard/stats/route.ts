import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FlashcardDeck from "@/models/Flashcard";
import StudyProgress from "@/models/StudyProgress";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalFlashcardDecks = await FlashcardDeck.countDocuments({ userId: user.userId });

    // Get completed chapters (100% progress decks)
    const completedChapters = await StudyProgress.countDocuments({
      userId: user.userId,
      progressPercentage: 100,
    });

    // Get total study hours (mock calculation based on progress records)
    const allProgress = await StudyProgress.find({ userId: user.userId }).lean();
    const studyHours = Math.round(allProgress.length * 0.5); // Rough estimate

    // Calculate current streak
    const progressRecords = await StudyProgress.find({ userId: user.userId })
      .sort({ lastStudied: -1 })
      .lean();

    let currentStreak = 0;
    if (progressRecords.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let checkDate = new Date(today);
      let streakBroken = false;

      for (let i = 0; i < progressRecords.length && !streakBroken; i++) {
        const studyDate = new Date(progressRecords[i].lastStudied);
        studyDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor(
          (checkDate.getTime() - studyDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0 || daysDiff === 1) {
          currentStreak++;
          checkDate = new Date(studyDate);
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          streakBroken = true;
        }
      }
    }

    return NextResponse.json({
      totalFlashcardDecks,
      completedChapters,
      studyHours,
      currentStreak,
    });
  } catch (error) {
    console.error("Fetch stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}