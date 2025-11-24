"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"

interface AnalyticsData {
  day: string
  progress: number
  date: string
}

export function LearningAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/dashboard/analytics")
      if (res.ok) {
        const data = await res.json()
        setAnalyticsData(data.analytics)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
          <CardDescription>Your study activity this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] md:h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2 md:pb-6">
        <CardTitle className="text-lg md:text-xl">Learning Progress</CardTitle>
        <CardDescription className="text-xs md:text-sm">Your study activity this week</CardDescription>
      </CardHeader>
      <CardContent className="px-2 md:px-6">
        <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
          <LineChart data={analyticsData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="day" 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: `1px solid var(--color-border)`,
                borderRadius: "0.75rem",
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="progress"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ fill: "var(--color-primary)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}