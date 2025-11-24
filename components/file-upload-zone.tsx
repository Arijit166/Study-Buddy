"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface PendingFile {
  file: File
  id: string
}

export function FileUploadZone({ onUploadSuccess }: { onUploadSuccess?: () => Promise<void> }) {
  const [dragActive, setDragActive] = useState(false)
  const [showNameDialog, setShowNameDialog] = useState(false)
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null)
  const [noteName, setNoteName] = useState("")
  const [uploading, setUploading] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles[0]) {
      handleFileSelect(droppedFiles[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PDF and images (PNG, JPG) are allowed')
      return
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size exceeds 50MB limit')
      return
    }

    setPendingFile({
      file,
      id: Math.random().toString(36).substr(2, 9)
    })
    setNoteName("")
    setShowNameDialog(true)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    e.target.value = ''
  }

  const handleUpload = async () => {
    if (!pendingFile || !noteName.trim()) {
      toast.error('Please enter a name for your note')
      return
    }

    setUploading(true)
    toast.loading('Uploading file...', { id: 'upload' })

    try {
      const formData = new FormData()
      formData.append('file', pendingFile.file)
      formData.append('name', noteName.trim())

      const response = await fetch('/api/notes/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setShowNameDialog(false)
        setPendingFile(null)
        setNoteName("")
        
        // Wait for the notes list to refresh completely
        if (onUploadSuccess) {
          await onUploadSuccess()  // Add await here
        }
        
        // Now show success after notes are loaded
        toast.success('File uploaded successfully!', { id: 'upload' })
      } else {
        toast.error(data.error || 'Failed to upload file', { id: 'upload' })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file', { id: 'upload' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <Card
        className={`border-2 border-dashed cursor-pointer transition-all duration-200 ${
          dragActive
            ? "border-primary bg-primary/5 shadow-md"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Upload Study Materials</h3>
              <p className="text-sm text-muted-foreground mt-1">Drag and drop your files or click to browse</p>
            </div>
            <div className="flex justify-center pt-2">
              <label htmlFor="file-upload">
                <Button className="gap-2 rounded-lg h-11 bg-primary hover:bg-primary/90" asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                    Browse Files
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileInputChange}
              />
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Supported formats: PDF, PNG, JPG (Max 50MB per file)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name Your Note</DialogTitle>
            <DialogDescription>
              Give your uploaded file a memorable name to easily find it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note-name">Note Name</Label>
              <Input
                id="note-name"
                placeholder="e.g., Chapter 5 Summary"
                value={noteName}
                onChange={(e) => setNoteName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpload()}
              />
            </div>
            {pendingFile && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-start gap-2">
                  <strong className="flex-shrink-0">File:</strong> 
                  <span className="break-all">{pendingFile.file.name}</span>
                </p>
                <p><strong>Size:</strong> {(pendingFile.file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNameDialog(false)
                setPendingFile(null)
                setNoteName("")
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !noteName.trim()}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}