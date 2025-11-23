import { Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-xs sm:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl ${
          role === "user"
            ? "bg-primary text-white rounded-br-none"
            : "bg-card border border-border text-foreground rounded-bl-none"
        }`}
      >
        {/* Message Content */}
        <div className="text-sm leading-relaxed">{content}</div>

        {/* Action Buttons for Assistant Messages */}
        {role === "assistant" && (
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full hover:bg-muted">
              <Copy className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full hover:bg-muted">
              <ThumbsUp className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full hover:bg-muted">
              <ThumbsDown className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
