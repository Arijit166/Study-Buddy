"use client"

import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { StudyStats } from "@/components/study-stats"
import { LearningAnalytics } from "@/components/learning-analytics"
import  RecentUploads  from "@/components/recent-uploads"
import { Card, CardContent } from "@/components/ui/card"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"
import { Upload, BookOpen, Brain } from "lucide-react"

export function DashboardClient() {
  const { user, loading } = useUser()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const firstName = user?.name?.split(" ")[0] || "Student"

  const quickActions = [
    {
      icon: Upload,
      label: "Upload Notes",
      path: "/notes",
      emoji: "📤",
    },
    {
      icon: Brain,
      label: "Take Quiz",
      path: "/quizzes",
      emoji: "🧠",
    },
    {
      icon: BookOpen,
      label: "Study Now",
      path: "/flashcards",
      emoji: "📚",
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar
          title={`Welcome back, ${firstName}!`}
          userName={user?.name}
          userAvatar={user?.avatar}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Stats Section */}
            <StudyStats />

            {/* Analytics & Recent Files */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2">
                <LearningAnalytics />
              </div>
              <div>
                <RecentUploads />
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-4 md:p-8">
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => router.push(action.path)}
                      className="p-4 md:p-5 rounded-lg bg-card hover:bg-card/80 transition-all hover:scale-105 border border-border text-center"
                    >
                      <p className="text-2xl md:text-3xl mb-2">{action.emoji}</p>
                      <p className="font-medium text-xs md:text-sm">{action.label}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}