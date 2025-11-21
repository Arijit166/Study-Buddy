import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { StudyStats } from "@/components/study-stats"
import { LearningAnalytics } from "@/components/learning-analytics"
import { RecentUploads } from "@/components/recent-uploads"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar title="Welcome back, Student" />

        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            {/* Stats Section */}
            <StudyStats />

            {/* Analytics & Recent Files */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LearningAnalytics />
              </div>
              <div>
                <RecentUploads />
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button className="p-4 rounded-lg bg-card hover:bg-card/80 transition-colors border border-border text-center">
                    <p className="text-2xl mb-2">📤</p>
                    <p className="font-medium text-sm">Upload Notes</p>
                  </button>
                  <button className="p-4 rounded-lg bg-card hover:bg-card/80 transition-colors border border-border text-center">
                    <p className="text-2xl mb-2">💬</p>
                    <p className="font-medium text-sm">Start AI Chat</p>
                  </button>
                  <button className="p-4 rounded-lg bg-card hover:bg-card/80 transition-colors border border-border text-center">
                    <p className="text-2xl mb-2">📚</p>
                    <p className="font-medium text-sm">Study Now</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
