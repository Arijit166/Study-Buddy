"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { ProfileHeader } from "@/components/profile-header"
import { StudyStatsDetailed } from "@/components/study-stats-detailed"
import { ProfileStatsCards } from "@/components/profile-stats-cards"
import { SettingsSection } from "@/components/settings-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/hooks/use-user"
import { toast } from "sonner"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const { user, loading, updateUser } = useUser();
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (user) {
      fetchStreak();
    }
  }, [user]);

  const fetchStreak = async () => {
    try {
      const res = await fetch("/api/profile/stats");
      if (res.ok) {
        const data = await res.json();
        setCurrentStreak(data.currentStreak);
      }
    } catch (error) {
      console.error("Failed to fetch streak:", error);
    }
  };

  const handleUpdateProfile = async (name: string, avatar: string | null) => {
    const result = await updateUser(name, avatar);
    
    if (result.success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
  };

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
              createdAt={user?.createdAt}
              currentStreak={currentStreak}
              onUpdateProfile={handleUpdateProfile}
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

              <TabsContent value="statistics" className="space-y-6">
                <StudyStatsDetailed />

                <ProfileStatsCards />
              </TabsContent>

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