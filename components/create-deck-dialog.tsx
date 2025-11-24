"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, X } from "lucide-react"

interface Card {
  question: string
  answer: string
}

interface CreateDeckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateDeck: (deck: {
    name: string
    subject: string
    category: string
    cards: Card[]
    isPublic: boolean
  }) => Promise<void>
}

export function CreateDeckDialog({ open, onOpenChange, onCreateDeck }: CreateDeckDialogProps) {
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("")
  const [cards, setCards] = useState<Card[]>([{ question: "", answer: "" }])
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const addCard = () => {
    setCards([...cards, { question: "", answer: "" }])
  }

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index))
    }
  }

  const updateCard = (index: number, field: "question" | "answer", value: string) => {
    const newCards = [...cards]
    newCards[index][field] = value
    setCards(newCards)
  }

  const handleSubmit = async () => {
    setError("")

    if (!name.trim() || !subject.trim() || !category.trim()) {
      setError("Please fill in deck name, subject, and category")
      return
    }

    const validCards = cards.filter(
      (card) => card.question.trim() && card.answer.trim()
    )

    if (validCards.length === 0) {
      setError("Please add at least one complete card")
      return
    }

    setLoading(true)
    try {
      await onCreateDeck({
        name: name.trim(),
        subject: subject.trim(),
        category: category.trim(),
        cards: validCards,
        isPublic,
      })
      
      // Reset form
      setName("")
      setSubject("")
      setCategory("")
      setCards([{ question: "", answer: "" }])
      setIsPublic(true)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Failed to create deck")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Flashcard Deck</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Deck Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Deck Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Photosynthesis"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Biology"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Plant Biology"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="isPublic" className="cursor-pointer">
                Make this deck public (visible to all users)
              </Label>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Flashcards</h3>
              <Button onClick={addCard} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Card
              </Button>
            </div>

            <div className="space-y-4">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3 bg-muted/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Card {index + 1}
                    </span>
                    {cards.length > 1 && (
                      <Button
                        onClick={() => removeCard(index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label>Question</Label>
                    <Textarea
                      value={card.question}
                      onChange={(e) =>
                        updateCard(index, "question", e.target.value)
                      }
                      placeholder="Enter the question..."
                      className="mt-1 min-h-20"
                    />
                  </div>

                  <div>
                    <Label>Answer</Label>
                    <Textarea
                      value={card.answer}
                      onChange={(e) =>
                        updateCard(index, "answer", e.target.value)
                      }
                      placeholder="Enter the answer..."
                      className="mt-1 min-h-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Deck"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}