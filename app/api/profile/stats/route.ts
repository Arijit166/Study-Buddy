import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Note from "@/models/Note";
import Quiz from "@/models/Quiz";
import mongoose from "mongoose";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(user.userId);

    // Get total notes uploaded
    const notesCount = await Note.countDocuments({ userId: user.userId });

    // Get completed quizzes
    const completedQuizzes = await Quiz.countDocuments({
      userId: userId,
      completedAt: { $exists: true, $ne: null }
    });

    // Calculate study streak (days with activity)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await Quiz.find({
    userId: userId,
    createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });

    // Calculate MAX streak 
    let maxStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (recentActivity.length > 0) {
    const activityDates = new Set(
        recentActivity.map(activity => {
        const date = new Date(activity.createdAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
        })
    );

    // Sort dates in descending order
    const sortedDates = Array.from(activityDates).sort((a, b) => b - a);
    
    let currentStreakCount = 1;
    
    for (let i = 0; i < sortedDates.length - 1; i++) {
        const currentDate = new Date(sortedDates[i]);
        const nextDate = new Date(sortedDates[i + 1]);
        
        // Check if dates are consecutive (1 day apart)
        const diffInDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 1) {
        currentStreakCount++;
        } else {
        // Streak broken, update max if needed and reset
        maxStreak = Math.max(maxStreak, currentStreakCount);
        currentStreakCount = 1;
        }
    }
    
    // Check final streak
    maxStreak = Math.max(maxStreak, currentStreakCount);
    }

    // Get weekly study data for chart (last 4 weeks)
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      weekEnd.setHours(23, 59, 59, 999);

      const quizzesThisWeek = await Quiz.countDocuments({
        userId: userId,
        createdAt: { $gte: weekStart, $lte: weekEnd }
      });

      const notesThisWeek = await Note.countDocuments({
        userId: user.userId,
        createdAt: { $gte: weekStart, $lte: weekEnd }
      });

      weeklyData.push({
        week: `Week ${4 - i}`,
        quizzes: quizzesThisWeek,
        notes: notesThisWeek,
      });
    }

    return NextResponse.json({
      notesUploaded: notesCount,
      quizzesCompleted: completedQuizzes,
      currentStreak: maxStreak,
      weeklyData: weeklyData
    });

  } catch (error) {
    console.error("Profile stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile stats" },
      { status: 500 }
    );
  }
}