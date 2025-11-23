"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { ChatMessage } from "@/components/chat-message"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatInput } from "@/components/chat-input"
import { toast } from "sonner"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const params = useParams()
  const noteId = params.noteId as string
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (noteId) {
      fetch(`/api/chat/${noteId}`)
        .then(res => res.json())
        .then(data => {
          if (data.messages) {
            setMessages(data.messages)
          }
          setLoading(false)
        })
        .catch(() => {
          toast.error('Failed to load chat history')
          setLoading(false)
        })
    }
  }, [noteId])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || sending) return

    const userMessage = { role: "user" as const, content: message }
    setMessages(prev => [...prev, userMessage])
    setSending(true)

    try {
      const response = await fetch(`/api/chat/${noteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: data.message 
        }])
        
        // Trigger sidebar refresh by dispatching custom event
        window.dispatchEvent(new Event('chatUpdated'))
      } else {
        toast.error(data.error || 'Failed to send message')
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleQuestionClick = (question: string) => {
    handleSendMessage(question)
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
        <TopNavbar title="AI Chat" />
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col bg-background">
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Start chatting about your notes!</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} role={msg.role} content={msg.content} />
              ))}
              {sending && (
                <div className="flex justify-start mb-4">
                  <div className="bg-card border border-border rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <ChatInput onSend={handleSendMessage} disabled={sending} />
          </div>
          <ChatSidebar noteId={noteId} onQuestionClick={handleQuestionClick} />
        </main>
      </div>
    </div>
  )
}