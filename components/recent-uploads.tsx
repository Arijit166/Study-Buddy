"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MessageSquare } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Note {
  _id: string
  name: string
  fileName: string
  fileType: string
  fileSize: number
  createdAt: string
}

export default function RecentUploads() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchRecentNotes()
  }, [])

  const fetchRecentNotes = async () => {
    try {
      const res = await fetch("/api/dashboard/recent-notes")
      if (res.ok) {
        const data = await res.json()
        setNotes(data.notes)
      }
    } catch (error) {
      console.error("Failed to fetch recent notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days === 1) return "1 day ago"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Recent Files</CardTitle>
          <CardDescription>Your recently uploaded study materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-xl"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Recent Files</CardTitle>
        <CardDescription>Your recently uploaded study materials</CardDescription>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <p>No files uploaded yet</p>
            <p className="text-xs mt-2">Upload your first note to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note._id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {note.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}