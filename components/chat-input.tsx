"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Send, Square } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function ChatInput({ onSend, disabled }: { onSend: (message: string) => void, disabled?: boolean }) {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  useEffect(() => {
    // Initialize speech recognition on mount
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true // Keep listening
        recognitionInstance.interimResults = true // Get results while speaking
        recognitionInstance.lang = 'en-US'

        recognitionInstance.onresult = (event: any) => {
          let interimTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' '
            } else {
              interimTranscript += transcript
            }
          }

          // Update message with final transcript
          if (finalTranscript) {
            setMessage(prev => prev + finalTranscript)
          }
        }

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          if (event.error !== 'no-speech') {
            toast.error('Voice input error: ' + event.error)
          }
          setIsRecording(false)
        }

        recognitionInstance.onend = () => {
          setIsRecording(false)
        }

        setRecognition(recognitionInstance)
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message)
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (message.trim() && !disabled) {
        onSend(message)
        setMessage("")
      }
    }
  }

  const toggleRecording = () => {
    if (!recognition) {
      toast.error('Voice input not supported in your browser. Please use Chrome or Edge.')
      return
    }

    if (isRecording) {
      recognition.stop()
      setIsRecording(false)
      toast.success('Recording stopped')
    } else {
      try {
        recognition.start()
        setIsRecording(true)
        toast.success('Listening... Speak now')
      } catch (error) {
        console.error('Failed to start recording:', error)
        toast.error('Failed to start recording')
      }
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px'
    }
  }, [message])

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-card p-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your notes..."
              className="resize-none rounded-xl border-border focus:ring-2 focus:ring-primary/50 min-h-11 max-h-32 p-3 pr-20"
              rows={1}
              disabled={disabled}
            />
            <div className="absolute bottom-3 right-3 flex gap-1">
              <Button 
                type="button" 
                size="sm" 
                variant="ghost" 
                className="h-7 w-7 p-0 rounded-full hover:bg-muted"
                disabled={disabled}
              >
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="ghost" 
                className={`h-7 w-7 p-0 rounded-full transition-colors ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'hover:bg-muted'
                }`}
                onClick={toggleRecording}
                disabled={disabled}
              >
                {isRecording ? (
                  <Square className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !message.trim()}
          className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {isRecording 
          ? '🔴 Listening... Speak now (click to stop)' 
          : 'Press Enter to send, Shift+Enter for new line'}
      </p>
    </form>
  )
}