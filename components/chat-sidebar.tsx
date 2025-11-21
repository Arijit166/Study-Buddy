import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

export function ChatSidebar() {
  return (
    <div className="w-64 bg-muted/30 border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm">Context</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Selected Notes */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">SELECTED NOTES</p>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-card border border-border">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">Biology Notes</p>
                  <p className="text-xs text-muted-foreground">Chapter 5</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">TOPICS EXTRACTED</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full">
              Photosynthesis
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              Cells
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              Enzymes
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              ATP
            </Badge>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">QUICK QUESTIONS</p>
          <div className="space-y-1">
            <button className="w-full text-left text-xs p-2 rounded-lg hover:bg-card transition-colors text-foreground">
              Explain photosynthesis
            </button>
            <button className="w-full text-left text-xs p-2 rounded-lg hover:bg-card transition-colors text-foreground">
              What are enzymes?
            </button>
            <button className="w-full text-left text-xs p-2 rounded-lg hover:bg-card transition-colors text-foreground">
              How does ATP work?
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
