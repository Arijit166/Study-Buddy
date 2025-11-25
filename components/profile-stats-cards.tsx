"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface ProfileStats {
  notesUploaded: number;
  quizzesCompleted: number;
  currentStreak: number;
}

export function ProfileStatsCards() {
  const [stats, setStats] = useState<ProfileStats>({
    notesUploaded: 0,
    quizzesCompleted: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/profile/stats");
      if (res.ok) {
        const data = await res.json();
        setStats({
          notesUploaded: data.notesUploaded,
          quizzesCompleted: data.quizzesCompleted,
          currentStreak: data.currentStreak,
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Quizzes Completed", value: stats.quizzesCompleted, unit: "quizzes" },
    { label: "Notes Uploaded", value: stats.notesUploaded, unit: "files" },
    { label: "Max Streak", value: stats.currentStreak, unit: "days" },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-md animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statCards.map((stat, idx) => (
        <Card key={idx} className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.unit}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}