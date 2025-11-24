"use client"

import { useState, useEffect } from "react"
import { Card as Flashcard, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCw, Volume2 } from "lucide-react"

interface Card {
  question: string
  answer: string
}

interface FlashcardViewerProps {
  deckId: string
  deckName: string
  cards: Card[]
  onClose?: () => void
  onProgressUpdate?: (correctCards: number[]) => void
}

export function FlashcardViewer({ 
  deckId, 
  deckName, 
  cards, 
  onClose,
  onProgressUpdate 
}: FlashcardViewerProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [markedCorrect, setMarkedCorrect] = useState<number[]>([])

  const currentCard = cards[currentCardIndex]
  const progress = cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0

  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate(markedCorrect)
    }
  }, [markedCorrect, onProgressUpdate])

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
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
      prev.includes(currentCardIndex) 
        ? prev.filter((id) => id !== currentCardIndex) 
        : [...prev, currentCardIndex]
    )
  }

  const handleSpeak = () => {
    const text = isFlipped ? currentCard.answer : currentCard.question
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const correctPercentage = cards.length > 0 
    ? Math.round((markedCorrect.length / cards.length) * 100) 
    : 0

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No cards available in this deck.</p>
        <Button onClick={onClose} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{deckName}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Card {currentCardIndex + 1} of {cards.length} • {correctPercentage}% Mastered
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
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(progress)}% Progress</span>
          <span>{markedCorrect.length} / {cards.length} Correct</span>
        </div>
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
              {isFlipped ? currentCard.answer : currentCard.question}
            </p>
            <p className="text-xs text-muted-foreground mt-6">
              {isFlipped ? "Click to see question" : "Click card to reveal answer"}
            </p>
          </div>
        </CardContent>
      </Flashcard>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 rounded-lg bg-transparent"
          onClick={handleSpeak}
        >
          <Volume2 className="w-4 h-4" />
          Speak
        </Button>
        <Button
          variant={markedCorrect.includes(currentCardIndex) ? "default" : "outline"}
          size="sm"
          onClick={toggleCorrect}
          className="gap-2 rounded-lg"
        >
          <RotateCw className="w-4 h-4" />
          {markedCorrect.includes(currentCardIndex) ? "Correct ✓" : "Mark Correct"}
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
          {currentCardIndex + 1} / {cards.length}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentCardIndex === cards.length - 1}
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