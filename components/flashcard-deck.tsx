"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Play, Search, ChevronRight, Filter } from "lucide-react"
import { useState, useEffect } from "react"

interface Deck {
  _id: string
  name: string
  subject: string
  category: string
  cardCount: number
  progress: number
}

interface FlashcardDeckProps {
  onStudy?: (deckId: string, deckName: string, cards: any[]) => void
}

export function FlashcardDeck({ onStudy }: FlashcardDeckProps) {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("")
  const [subjects, setSubjects] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const limit = 6

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchDecks()
  }, [search, subject, category, skip])

  const fetchFilters = async () => {
    try {
      const res = await fetch("/api/flashcards/filters")
      const data = await res.json()
      setSubjects(data.subjects || [])
      setCategories(data.categories || [])
    } catch (error) {
      console.error("Failed to fetch filters:", error)
    }
  }

  const fetchDecks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        limit: limit.toString(),
        skip: skip.toString(),
      })
      if (subject) params.append("subject", subject)
      if (category) params.append("category", category)

      const res = await fetch(`/api/flashcards?${params}`)
      const data = await res.json()
      
      if (skip === 0) {
        setDecks(data.decks || [])
      } else {
        setDecks(prev => [...prev, ...(data.decks || [])])
      }
      setHasMore(data.hasMore || false)
    } catch (error) {
      console.error("Failed to fetch decks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStudy = async (deckId: string) => {
    try {
      const res = await fetch(`/api/flashcards/${deckId}`)
      const data = await res.json()
      onStudy?.(deckId, data.deck.name, data.deck.cards)
    } catch (error) {
      console.error("Failed to fetch deck:", error)
    }
  }

  const loadMore = () => {
    setSkip(prev => prev + limit)
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSkip(0)
              }}
              placeholder="Search flashcard decks..."
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value)
                  setSkip(0)
                }}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setSkip(0)
                }}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Deck Grid */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {search || subject || category ? "Search Results" : "Available Flashcard Decks"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Study with community-created flashcard decks
        </p>
      </div>

      {loading && skip === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading decks...</p>
        </div>
      ) : decks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No decks found. Create one to get started!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <Card
                key={deck._id}
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
                  
                  <h4 className="text-lg font-semibold text-foreground mb-1">
                    {deck.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    {deck.subject} • {deck.category}
                  </p>

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
                    onClick={() => handleStudy(deck._id)}
                    className="w-full gap-2 rounded-lg h-10 bg-primary hover:bg-primary/90 text-white group-hover:shadow-md transition-all"
                  >
                    <Play className="w-4 h-4" />
                    Study Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={loadMore}
                variant="outline"
                className="gap-2"
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}