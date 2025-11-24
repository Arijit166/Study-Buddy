"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { FlashcardDeck } from "@/components/flashcard-deck"
import { FlashcardViewer } from "@/components/flashcard-viewer"
import { CreateDeckDialog } from "@/components/create-deck-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"
import { Plus } from "lucide-react"

export default function FlashcardsPage() {
  const [activeStudyDeck, setActiveStudyDeck] = useState<{
    id: string
    name: string
    cards: any[]
  } | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { user } = useUser()

  const handleStudy = (deckId: string, deckName: string, cards: any[]) => {
    setActiveStudyDeck({ id: deckId, name: deckName, cards })
  }

  const handleCreateDeck = async (deck: any) => {
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deck),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create deck")
      }

      // Refresh the page to show new deck
      window.location.reload()
    } catch (error: any) {
      throw error
    }
  }

  const handleProgressUpdate = async (correctCards: number[]) => {
    if (!activeStudyDeck) return

    try {
      await fetch("/api/flashcards/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckId: activeStudyDeck.id,
          correctCards,
        }),
      })
    } catch (error) {
      console.error("Failed to update progress:", error)
    }
  }

  if (activeStudyDeck) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar
            title="Flashcards - Study Mode"
            userName={user?.name}
            userAvatar={user?.avatar}
          />
          <main className="flex-1 overflow-auto p-8">
            <FlashcardViewer
              deckId={activeStudyDeck.id}
              deckName={activeStudyDeck.name}
              cards={activeStudyDeck.cards}
              onClose={() => setActiveStudyDeck(null)}
              onProgressUpdate={handleProgressUpdate}
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
        <TopNavbar
          title="Flashcards"
          userName={user?.name}
          userAvatar={user?.avatar}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            {/* Create New Deck */}
            <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-muted/20 hover:bg-muted/40">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Create New Deck
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Build a custom flashcard deck for any topic
                    </p>
                  </div>
                  <Button
                    className="gap-2 rounded-lg h-11 bg-accent hover:bg-accent/90"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="w-5 h-5" />
                    New Deck
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Deck Grid */}
            <FlashcardDeck onStudy={handleStudy} />
          </div>
        </main>
      </div>

      <CreateDeckDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateDeck={handleCreateDeck}
      />
    </div>
  )
}