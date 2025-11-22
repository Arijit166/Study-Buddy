"use client"
import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { ProfileHeader } from "@/components/profile-header"
import { StudyStatsDetailed } from "@/components/study-stats-detailed"
import { SettingsSection } from "@/components/settings-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/hooks/use-user"

export default function ProfilePage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar 
          title="Profile"
          userName={user?.name}
          userAvatar={user?.avatar}
        />

        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            {/* Profile Header */}
            <ProfileHeader 
              userName={user?.name}
              userEmail={user?.email}
              userAvatar={user?.avatar}
            />

            {/* Tabs */}
            <Tabs defaultValue="statistics" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 rounded-lg bg-muted">
                <TabsTrigger value="statistics" className="rounded-md">
                  Statistics
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-md">
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Statistics Tab */}
              <TabsContent value="statistics" className="space-y-6">
                <StudyStatsDetailed />

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Study Hours", value: "44", unit: "hours" },
                    { label: "Quizzes Completed", value: "14", unit: "quizzes" },
                    { label: "Notes Uploaded", value: "18", unit: "files" },
                    { label: "Current Streak", value: "7", unit: "days" },
                  ].map((stat, idx) => (
                    <Card key={idx} className="border-0 shadow-md">
                      <CardContent className="p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
                        <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.unit}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <SettingsSection />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
