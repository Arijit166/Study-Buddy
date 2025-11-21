"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const analyticsData = [
  { day: "Mon", progress: 40 },
  { day: "Tue", progress: 65 },
  { day: "Wed", progress: 45 },
  { day: "Thu", progress: 75 },
  { day: "Fri", progress: 85 },
  { day: "Sat", progress: 70 },
  { day: "Sun", progress: 90 },
]

export function LearningAnalytics() {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Learning Progress</CardTitle>
        <CardDescription>Your study activity this week</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: `1px solid var(--color-border)`,
                borderRadius: "0.75rem",
              }}
            />
            <Line
              type="monotone"
              dataKey="progress"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ fill: "var(--color-primary)", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
