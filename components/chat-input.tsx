"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Send, Paperclip } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export function ChatInput() {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      setMessage("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-card p-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about your notes..."
              className="resize-none rounded-xl border-border focus:ring-2 focus:ring-primary/50 min-h-11 max-h-24 p-3"
              rows={1}
            />
            <div className="absolute bottom-3 right-3 flex gap-1">
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full hover:bg-muted">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full hover:bg-muted">
                <Mic className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
        <Button
          type="submit"
          size="icon"
          className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
    </form>
  )
}
