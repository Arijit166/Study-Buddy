"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, BookOpen, Loader2 } from "lucide-react"

interface Note {
  _id: string
  name: string
  fileName: string
}

interface StudyPlanFormProps {
  onGenerate: (data: {
    topic: string
    startDate: string
    endDate: string
    selectedNotes: string[]
  }) => void
  isGenerating: boolean
}

export function StudyPlanForm({ onGenerate, isGenerating }: StudyPlanFormProps) {
  const [topic, setTopic] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [loadingNotes, setLoadingNotes] = useState(true)

  useEffect(() => {
    fetchNotes()
    
    // Set default dates
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    
    setStartDate(today.toISOString().split('T')[0])
    setEndDate(nextWeek.toISOString().split('T')[0])
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes')
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoadingNotes(false)
    }
  }

  const toggleNote = (noteId: string) => {
    setSelectedNotes(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!topic.trim()) {
      alert('Please enter a topic')
      return
    }
    
    if (selectedNotes.length === 0) {
      alert('Please select at least one note')
      return
    }
    
    if (new Date(endDate) <= new Date(startDate)) {
      alert('End date must be after start date')
      return
    }

    onGenerate({ topic, startDate, endDate, selectedNotes })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card border border-border rounded-lg shadow-sm p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Generate Study Plan</h2>
          <p className="text-muted-foreground">
            Create a personalized study plan based on your notes and timeline
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Topic / Subject
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Machine Learning Fundamentals"
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isGenerating}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isGenerating}
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isGenerating}
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Notes Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Select Notes to Include
            </label>
            {loadingNotes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No notes available. Please upload some notes first.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto p-2">
                {notes.map((note) => (
                  <label
                    key={note._id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedNotes.includes(note._id)}
                      onChange={() => toggleNote(note._id)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      disabled={isGenerating}
                    />
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{note.name}</div>
                      <div className="text-xs text-muted-foreground">{note.fileName}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {selectedNotes.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {selectedNotes.length} note{selectedNotes.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isGenerating || notes.length === 0}
            className="w-full py-6 text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Study Plan...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5 mr-2" />
                Generate Study Plan
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}