"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"

interface WeeklyData {
  week: string;
  quizzes: number;
  notes: number;
}

export function StudyStatsDetailed() {
  const [studyHistory, setStudyHistory] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudyHistory();
  }, []);

  const fetchStudyHistory = async () => {
    try {
      const res = await fetch("/api/profile/stats");
      if (res.ok) {
        const data = await res.json();
        setStudyHistory(data.weeklyData);
      }
    } catch (error) {
      console.error("Failed to fetch study history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Study History</CardTitle>
          <CardDescription>Your study activity over the past month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Study History</CardTitle>
        <CardDescription>Your study activity over the past month</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={studyHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: `1px solid var(--color-border)`,
                borderRadius: "0.75rem",
              }}
            />
            <Legend />
            <Bar dataKey="quizzes" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="notes" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}