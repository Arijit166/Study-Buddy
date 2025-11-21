import { Card, CardContent } from "@/components/ui/card"
import { Flame, BookMarked, CheckCircle2 } from "lucide-react"

export function StudyStats() {
  const stats = [
    { icon: Flame, label: "Study Streak", value: "7", subtext: "days", color: "text-orange-500" },
    { icon: BookMarked, label: "Chapters Completed", value: "24", subtext: "chapters", color: "text-primary" },
    { icon: CheckCircle2, label: "Flashcards Created", value: "156", subtext: "cards", color: "text-accent" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.subtext}</p>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
