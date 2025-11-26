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
        <main className="flex-1 overflow-auto bg-gradient-to-b from-background to-background/95">
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
            <Card className="border border-primary/20 shadow-2xl bg-gradient-to-br from-primary/10 via-card to-secondary/5 backdrop-blur-sm hover:shadow-primary/20 transition-all">
              <CardContent className="p-4 md:p-8">
                <h3 className="text-base md:text-lg font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => router.push(action.path)}
                      className="group p-4 md:p-6 rounded-xl bg-gradient-to-br from-card to-card/50 hover:from-primary/20 hover:to-secondary/10 transition-all hover:scale-110 border border-border/50 hover:border-primary/50 text-center shadow-lg hover:shadow-primary/30 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/20 group-hover:to-accent/10 transition-all"></div>
                      <p className="text-2xl md:text-3xl mb-2 relative z-10 group-hover:scale-110 transition-transform">{action.emoji}</p>
                      <p className="font-semibold text-xs md:text-sm text-foreground relative z-10 group-hover:text-primary transition-colors">{action.label}</p>
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