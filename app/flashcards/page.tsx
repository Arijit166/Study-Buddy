"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { FlashcardDeck } from "@/components/flashcard-deck"
import { FlashcardViewer } from "@/components/flashcard-viewer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function FlashcardsPage() {
  const [activeStudyDeck, setActiveStudyDeck] = useState<number | null>(null)

  if (activeStudyDeck) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar title="Flashcards - Study Mode" />

          <main className="flex-1 overflow-auto p-8">
            <FlashcardViewer
              deckId={activeStudyDeck}
              deckName="Photosynthesis"
              cards={[]}
              onClose={() => setActiveStudyDeck(null)}
            />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar title="Flashcards" />

        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            {/* Create New Deck */}
            <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-muted/20 hover:bg-muted/40">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Create New Deck</h3>
                    <p className="text-sm text-muted-foreground mt-1">Build a custom flashcard deck for any topic</p>
                  </div>
                  <Button className="gap-2 rounded-lg h-11 bg-accent hover:bg-accent/90">
                    <Plus className="w-5 h-5" />
                    New Deck
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Deck Grid */}
            <FlashcardDeck onStudy={setActiveStudyDeck} />
          </div>
        </main>
      </div>
    </div>
  )
}
