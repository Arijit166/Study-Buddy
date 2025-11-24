import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StudyProgress from "@/models/StudyProgress";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get last 7 days of study progress
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const progressRecords = await StudyProgress.find({
      userId: user.userId,
      lastStudied: { $gte: sevenDaysAgo },
    })
      .sort({ lastStudied: 1 })
      .lean();

    // Create a map for the last 7 days
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const analyticsData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayName = days[date.getDay()];

      // Find progress records for this day
      const dayRecords = progressRecords.filter((record) => {
        const recordDate = new Date(record.lastStudied);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === date.getTime();
      });

      // Calculate average progress for the day
      const avgProgress =
        dayRecords.length > 0
          ? Math.round(
              dayRecords.reduce((sum, r) => sum + r.progressPercentage, 0) /
                dayRecords.length
            )
          : 0;

      analyticsData.push({
        day: dayName,
        progress: avgProgress,
        date: date.toISOString(),
      });
    }

    return NextResponse.json({ analytics: analyticsData });
  } catch (error) {
    console.error("Fetch analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}