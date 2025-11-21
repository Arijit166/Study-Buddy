import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MessageSquare } from "lucide-react"

const recentFiles = [
  { id: 1, name: "Chapter 5 - Biology Notes", date: "2 hours ago" },
  { id: 2, name: "Math Formulas Sheet", date: "1 day ago" },
  { id: 3, name: "Literature Summary", date: "3 days ago" },
]

export function RecentUploads() {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Recent Files</CardTitle>
        <CardDescription>Your recently uploaded study materials</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.date}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Chat</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
