import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MessageSquare, Trash2, Calendar } from "lucide-react"

const uploadedNotes = [
  {
    id: 1,
    name: "Advanced Calculus - Chapter 3",
    date: "Nov 20, 2025",
    size: "2.4 MB",
    type: "PDF",
  },
  {
    id: 2,
    name: "Biology: Photosynthesis Notes",
    date: "Nov 18, 2025",
    size: "1.8 MB",
    type: "DOCX",
  },
  {
    id: 3,
    name: "History Timeline Summary",
    date: "Nov 15, 2025",
    size: "856 KB",
    type: "PDF",
  },
  {
    id: 4,
    name: "Chemistry Periodic Table",
    date: "Nov 12, 2025",
    size: "3.2 MB",
    type: "PDF",
  },
]

export function NotesLibrary() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Your Notes Library</h3>
        <p className="text-sm text-muted-foreground">Access all your uploaded study materials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uploadedNotes.map((note) => (
          <Card key={note.id} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{note.name}</h4>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {note.date}
                    </span>
                    <span>{note.size}</span>
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{note.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1 gap-2 rounded-lg h-9 bg-primary hover:bg-primary/90">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Button>
                <Button size="sm" variant="ghost" className="rounded-lg h-9">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
