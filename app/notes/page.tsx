"use client"

import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { FileUploadZone } from "@/components/file-upload-zone"
import { NotesList } from "@/components/notes-list"
import { useUser } from "@/hooks/use-user"
import { useState } from "react"

export default function NotesPage() {
  const { user, loading } = useUser()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar 
          title="Notes"
          userName={user?.name}
          userAvatar={user?.avatar}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-6">
            <FileUploadZone onUploadSuccess={handleUploadSuccess} />
            <NotesList refreshTrigger={refreshTrigger} />
          </div>
        </main>
      </div>
    </div>
  )
}