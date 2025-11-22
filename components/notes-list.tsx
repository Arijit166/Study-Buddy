"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Trash2, Download, MessageSquare } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface Note {
  _id: string
  name: string
  fileName: string
  fileType: string
  fileSize: number
  createdAt: string
}

export function NotesList({ refreshTrigger }: { refreshTrigger?: number }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [loadingPreviews, setLoadingPreviews] = useState<Record<string, boolean>>({})

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes')
      const data = await response.json()
      
      if (response.ok) {
        setNotes(data.notes)
        // Load previews for each note
        data.notes.forEach((note: Note) => {
          loadPreview(note._id, note.fileType)
        })
      } else {
        toast.error('Failed to load notes')
      }
    } catch (error) {
      console.error('Fetch notes error:', error)
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const loadPreview = async (id: string, fileType: string) => {
    setLoadingPreviews(prev => ({ ...prev, [id]: true }))
    
    try {
      const response = await fetch(`/api/notes/${id}/thumbnail`)
      const data = await response.json()

      if (response.ok && data.thumbnail) {
        setPreviews(prev => ({
          ...prev,
          [id]: `data:${data.type};base64,${data.thumbnail}`
        }))
      }
    } catch (error) {
      console.error('Preview load error:', error)
    } finally {
      setLoadingPreviews(prev => ({ ...prev, [id]: false }))
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [refreshTrigger])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Note deleted successfully')
        setNotes(notes.filter(note => note._id !== id))
        setPreviews(prev => {
          const newPreviews = { ...prev }
          delete newPreviews[id]
          return newPreviews
        })
      } else {
        toast.error(data.error || 'Failed to delete note')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete note')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = async (id: string, fileName: string, fileType: string) => {
    setDownloadingId(id)
    try {
      const response = await fetch(`/api/notes/${id}`)
      const data = await response.json()

      if (response.ok) {
        const byteCharacters = atob(data.fileData)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: fileType })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast.success('Download started')
      } else {
        toast.error('Failed to download file')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    } finally {
      setDownloadingId(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const PDFPlaceholder = () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
      <div className="text-center p-6">
        <div className="relative inline-block">
          <div className="absolute -top-1 -left-1 w-24 h-32 bg-red-200 rounded-lg border-2 border-red-300 opacity-40"></div>
          <div className="absolute -top-0.5 -left-0.5 w-24 h-32 bg-red-100 rounded-lg border-2 border-red-200 opacity-60"></div>
          <div className="relative w-24 h-32 bg-white rounded-lg border-2 border-red-400 shadow-lg flex flex-col items-center justify-center p-3">
            <FileText className="w-12 h-12 text-red-500 mb-2" />
            <div className="space-y-1 w-full">
              <div className="h-1.5 bg-red-200 rounded w-3/4 mx-auto"></div>
              <div className="h-1.5 bg-red-200 rounded w-full"></div>
              <div className="h-1.5 bg-red-200 rounded w-5/6 mx-auto"></div>
            </div>
          </div>
        </div>
        <p className="text-xs text-red-600 mt-3 font-medium">PDF Document</p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-12">
          <div className="text-center">
            <FileText className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No notes yet</h3>
            <p className="text-sm text-muted-foreground">Upload your first study material to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Your Notes ({notes.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <Card key={note._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Note Name */}
              <h3 className="text-lg font-semibold text-foreground mb-4 truncate" title={note.name}>
                {note.name}
              </h3>

              {/* File Preview */}
              <div className="mb-4 bg-muted/30 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                {loadingPreviews[note._id] ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : previews[note._id] ? (
                  <img 
                    src={previews[note._id]} 
                    alt={note.name}
                    className="w-full h-full object-cover"
                  />
                ) : note.fileType.includes('pdf') ? (
                  <PDFPlaceholder />
                ) : (
                  <FileText className="w-16 h-16 text-muted-foreground" />
                )}
              </div>

              {/* Date and Size */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-6 pb-6 border-b">
                <span className="flex items-center gap-2">
                  📅 {formatDate(note.createdAt)}
                </span>
                <span className="flex items-center gap-2">
                  💾 {formatFileSize(note.fileSize)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  className="flex-1 gap-2 h-11"
                  onClick={() => toast.info('Chat feature coming soon!')}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  onClick={() => handleDownload(note._id, note.fileName, note.fileType)}
                  disabled={downloadingId === note._id}
                  title="Download"
                >
                  {downloadingId === note._id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                      disabled={deletingId === note._id}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Note</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete <strong>"{note.name}"</strong>? This action cannot be undone and the file will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(note._id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}