"use client"

import { useState } from "react"
import { Card as Flashcard, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCw, Volume2 } from "lucide-react"

interface FlashcardViewerProps {
  deckId: number
  deckName: string
  cards: any[]
  onClose?: () => void
}

const sampleCards = [
  {
    id: 1,
    front: "What is photosynthesis?",
    back: "Photosynthesis is the process by which plants convert light energy into chemical energy, storing it in glucose molecules. It occurs primarily in the chloroplasts and uses water, carbon dioxide, and sunlight.",
  },
  {
    id: 2,
    front: "What are the two main stages of photosynthesis?",
    back: "1. Light-dependent reactions: Occur in thylakoids, produce ATP and NADPH\n2. Light-independent reactions (Calvin cycle): Occur in stroma, produce glucose",
  },
  {
    id: 3,
    front: "What role does chlorophyll play?",
    back: "Chlorophyll absorbs photons of light energy, particularly in the blue and red wavelengths, while reflecting green light. This excites electrons to higher energy levels, initiating the electron transport chain.",
  },
  {
    id: 4,
    front: "Explain the Calvin cycle.",
    back: "The Calvin cycle is a three-step process:\n1. Carbon fixation: CO₂ combines with RuBP\n2. Reduction: ATP and NADPH are used\n3. Regeneration: RuBP is regenerated from G3P",
  },
]

export function FlashcardViewer({ deckId, deckName, onClose }: FlashcardViewerProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [markedCorrect, setMarkedCorrect] = useState<number[]>([])

  const currentCard = sampleCards[currentCardIndex]
  const progress = ((currentCardIndex + 1) / sampleCards.length) * 100

  const handleNext = () => {
    if (currentCardIndex < sampleCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false)
    }
  }

  const toggleCorrect = () => {
    setMarkedCorrect((prev) =>
      prev.includes(currentCard.id) ? prev.filter((id) => id !== currentCard.id) : [...prev, currentCard.id],
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{deckName}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Card {currentCardIndex + 1} of {sampleCards.length}
          </p>
        </div>
        <Button variant="outline" onClick={onClose} className="rounded-lg bg-transparent">
          Exit Study
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}%</p>
      </div>

      {/* Flashcard */}
      <Flashcard
        onClick={() => setIsFlipped(!isFlipped)}
        className="border-0 shadow-xl cursor-pointer min-h-64 flex items-center justify-center hover:shadow-2xl transition-all duration-300"
      >
        <CardContent className="p-8 text-center w-full">
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {isFlipped ? "Answer" : "Question"}
            </p>
            <p className="text-2xl font-semibold text-foreground leading-relaxed whitespace-pre-wrap">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
            <p className="text-xs text-muted-foreground mt-6">Click card to reveal answer</p>
          </div>
        </CardContent>
      </Flashcard>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button variant="outline" size="sm" className="gap-2 rounded-lg bg-transparent">
          <Volume2 className="w-4 h-4" />
          Speak
        </Button>
        <Button
          variant={markedCorrect.includes(currentCard.id) ? "default" : "outline"}
          size="sm"
          onClick={toggleCorrect}
          className="gap-2 rounded-lg"
        >
          <RotateCw className="w-4 h-4" />
          {markedCorrect.includes(currentCard.id) ? "Correct" : "Mark Correct"}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentCardIndex === 0}
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 bg-transparent"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="text-sm text-muted-foreground">
          {currentCardIndex + 1} / {sampleCards.length}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentCardIndex === sampleCards.length - 1}
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 bg-transparent"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
