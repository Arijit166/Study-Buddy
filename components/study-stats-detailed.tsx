import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const studyHistory = [
  { week: "Week 1", hours: 8, quizzes: 2, notes: 3 },
  { week: "Week 2", hours: 12, quizzes: 4, notes: 5 },
  { week: "Week 3", hours: 10, quizzes: 3, notes: 4 },
  { week: "Week 4", hours: 14, quizzes: 5, notes: 6 },
]

export function StudyStatsDetailed() {
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
            <Bar dataKey="hours" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="quizzes" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="notes" fill="var(--color-secondary)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
