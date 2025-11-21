"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Play } from "lucide-react"

interface Deck {
  id: number
  topic: string
  cardCount: number
  progress: number
}

const decks: Deck[] = [
  { id: 1, topic: "Photosynthesis", cardCount: 24, progress: 65 },
  { id: 2, topic: "Cell Biology", cardCount: 18, progress: 40 },
  { id: 3, topic: "Genetics Basics", cardCount: 32, progress: 15 },
  { id: 4, topic: "Enzymes & ATP", cardCount: 20, progress: 80 },
  { id: 5, topic: "Mitochondria", cardCount: 15, progress: 50 },
  { id: 6, topic: "DNA Structure", cardCount: 22, progress: 25 },
]

interface FlashcardDeckProps {
  onStudy?: (deckId: number) => void
}

export function FlashcardDeck({ onStudy }: FlashcardDeckProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Your Flashcard Decks</h3>
        <p className="text-sm text-muted-foreground">Create and study with flashcard decks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck) => (
          <Card
            key={deck.id}
            className="border-0 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                  <BookOpen className="w-5 h-5 text-secondary-foreground" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {deck.cardCount} cards
                </span>
              </div>

              <h4 className="text-lg font-semibold text-foreground mb-1">{deck.topic}</h4>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <p className="text-xs font-medium text-foreground">{deck.progress}%</p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary to-accent transition-all duration-300"
                    style={{ width: `${deck.progress}%` }}
                  ></div>
                </div>
              </div>

              <Button
                onClick={() => onStudy?.(deck.id)}
                className="w-full gap-2 rounded-lg h-10 bg-primary hover:bg-primary/90 text-white group-hover:shadow-md transition-all"
              >
                <Play className="w-4 h-4" />
                Study Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
