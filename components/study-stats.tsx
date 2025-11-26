"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Clock, TrendingUp, Flame, Lightbulb } from "lucide-react"
import { useEffect, useState } from "react"

interface Stats {
  totalFlashcardDecks: number
  completedChapters: number
  studyHours: number
  currentStreak: number
}

export function StudyStats() {
  const [stats, setStats] = useState<Stats>({
    totalFlashcardDecks: 0,
    completedChapters: 0,
    studyHours: 0,
    currentStreak: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Study Hours",
      value: stats.studyHours,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      gradient: "from-blue-500/20 to-blue-500/5",
    },
    {
      title: "Flashcards Created",
      value: stats.totalFlashcardDecks,
      icon: Lightbulb,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      gradient: "from-green-500/20 to-green-500/5",
    },
    {
      title: "Chapters Completed",
      value: stats.completedChapters,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      gradient: "from-purple-500/20 to-purple-500/5",
    },
    {
      title: "Current Streak",
      value: `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`,
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      gradient: "from-orange-500/20 to-orange-500/5",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-md animate-pulse">
            <CardContent className="p-4 md:p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className={`border border-${stat.gradient.split('/')[0]}/20 shadow-lg hover:shadow-xl hover:shadow-${stat.gradient.split('/')[0]}/30 transition-all duration-300 bg-gradient-to-br from-card to-card/50 hover:scale-105`}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground/70 mb-1 md:mb-2 font-medium">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
                    {stat.value}
                  </h3>
                </div>
                <div className={`p-3 md:p-4 rounded-lg bg-gradient-to-br ${stat.gradient} border border-${stat.gradient.split('/')[0]}/30 shrink-0`}>
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}