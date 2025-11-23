"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

interface ChatSidebarProps {
  noteId: string
  onQuestionClick?: (question: string) => void
}

export function ChatSidebar({ noteId, onQuestionClick }: ChatSidebarProps) {
  const [context, setContext] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/chat/${noteId}/context`)
      .then(res => res.json())
      .then(data => {
        setContext(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [noteId])

  if (loading) {
    return (
      <div className="w-64 bg-muted/30 border-l border-border flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-muted/30 border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm">Context</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">SELECTED NOTE</p>
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {context?.note?.name || "Loading..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {context?.note?.fileName || ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {context?.topics && context.topics.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">TOPICS EXTRACTED</p>
            <div className="flex flex-wrap gap-2">
              {context.topics.map((topic: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="rounded-full">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {context?.suggestedQuestions && context.suggestedQuestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">SUGGESTED QUESTIONS</p>
            <div className="space-y-1">
              {context.suggestedQuestions.map((question: string, idx: number) => (
                <button
                  key={idx}
                  className="w-full text-left text-xs p-2 rounded-lg hover:bg-card transition-colors text-foreground"
                  onClick={() => onQuestionClick?.(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {!context?.isProcessed && (
          <div className="text-center text-sm text-muted-foreground p-4">
            Processing note...
          </div>
        )}
      </div>
    </div>
  )
}