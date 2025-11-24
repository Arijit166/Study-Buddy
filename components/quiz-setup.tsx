"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, FileText, Sparkles } from "lucide-react"

interface SearchResult {
  id: string
  name: string
  type: 'note' | 'flashcard'
  fileType?: string
  subject?: string
}

interface QuizSetupProps {
  onGenerate?: (config: QuizConfig) => void
}

interface QuizConfig {
  topic: string
  sourceType: 'note' | 'flashcard' | 'ai-generated'
  sourceId?: string
  questionCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  questionTypes: string[]
  customNotes?: string
}

export default function QuizSetup({ onGenerate }: QuizSetupProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedSource, setSelectedSource] = useState<SearchResult | null>(null)
  const [customTopic, setCustomTopic] = useState("")
  const [useCustomTopic, setUseCustomTopic] = useState(false)
  
  const [questionCount, setQuestionCount] = useState("10")
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>("medium")
  const [mcq, setMcq] = useState(true)
  const [trueFalse, setTrueFalse] = useState(true)
  const [shortAnswer, setShortAnswer] = useState(false)
  const [customNotes, setCustomNotes] = useState("")
  const [generating, setGenerating] = useState(false)

  // Search topics
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchTopics()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [searchQuery])

  const searchTopics = async () => {
    setSearching(true)
    try {
      const res = await fetch(`/api/quiz/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setSearching(false)
    }
  }

  const handleGenerate = async () => {
    const questionTypes = []
    if (mcq) questionTypes.push('mcq')
    if (trueFalse) questionTypes.push('true-false')
    if (shortAnswer) questionTypes.push('short-answer')

    if (questionTypes.length === 0) {
      alert("Please select at least one question type")
      return
    }

    const config: QuizConfig = {
      topic: useCustomTopic ? customTopic : (selectedSource?.name || customTopic),
      sourceType: useCustomTopic ? 'ai-generated' : (selectedSource?.type || 'ai-generated'),
      sourceId: selectedSource?.id,
      questionCount: parseInt(questionCount),
      difficulty,
      questionTypes,
      customNotes,
    }

    setGenerating(true)
    onGenerate?.(config)
  }

  return (
    <Card className="border-0 shadow-md max-w-2xl">
      <CardHeader>
        <CardTitle>Generate Quiz</CardTitle>
        <CardDescription>Customize your quiz settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Topic Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Select Topic</Label>
          
          <div className="flex gap-2 mb-3">
            <Button
              type="button"
              variant={!useCustomTopic ? "default" : "outline"}
              onClick={() => setUseCustomTopic(false)}
              className="flex-1"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              My Notes/Flashcards
            </Button>
            <Button
              type="button"
              variant={useCustomTopic ? "default" : "outline"}
              onClick={() => setUseCustomTopic(true)}
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Custom Topic
            </Button>
          </div>

          {!useCustomTopic ? (
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search your notes or flashcards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-lg"
              />
              
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        setSelectedSource(result)
                        setSearchQuery(result.name)
                        setSearchResults([])
                      }}
                      className="w-full p-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                    >
                      {result.type === 'note' ? (
                        <FileText className="w-5 h-5 text-blue-500" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium">{result.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.type === 'note' ? 'Note' : 'Flashcard Deck'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {searching && (
                <div className="text-sm text-muted-foreground mt-2">Searching...</div>
              )}
              
              {selectedSource && (
                <div className="mt-2 p-3 bg-muted rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedSource.type === 'note' ? (
                      <FileText className="w-4 h-4 text-blue-500" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-green-500" />
                    )}
                    <span className="font-medium">{selectedSource.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSource(null)
                      setSearchQuery("")
                    }}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Input
              placeholder="Enter any topic (e.g., World War 2, Calculus, Chemistry)..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="h-11 rounded-lg"
            />
          )}
        </div>

        {/* Question Count */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Number of Questions</Label>
          <Select value={questionCount} onValueChange={setQuestionCount}>
            <SelectTrigger className="rounded-lg h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 Questions</SelectItem>
              <SelectItem value="10">10 Questions</SelectItem>
              <SelectItem value="15">15 Questions</SelectItem>
              <SelectItem value="20">20 Questions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Level */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Difficulty Level</Label>
          <RadioGroup value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="easy" id="easy" />
              <Label htmlFor="easy" className="font-normal cursor-pointer">
                Easy - Focus on key concepts
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium" className="font-normal cursor-pointer">
                Medium - Mixed difficulty
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="hard" id="hard" />
              <Label htmlFor="hard" className="font-normal cursor-pointer">
                Hard - In-depth understanding
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Question Types */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Question Types</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="mcq"
                checked={mcq}
                onChange={(e) => setMcq(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="mcq" className="font-normal cursor-pointer">
                Multiple Choice
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="true-false"
                checked={trueFalse}
                onChange={(e) => setTrueFalse(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="true-false" className="font-normal cursor-pointer">
                True/False
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="short-answer"
                checked={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="short-answer" className="font-normal cursor-pointer">
                Short Answer
              </Label>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-3">
          <Label htmlFor="notes" className="text-base font-semibold">
            Additional Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Any specific areas to focus on or concepts to avoid..."
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            className="resize-none rounded-lg border-input focus:ring-2 focus:ring-primary/50 min-h-20"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={generating || (!useCustomTopic && !selectedSource) || (useCustomTopic && !customTopic)}
          className="w-full h-12 rounded-lg text-base font-semibold bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200"
        >
          {generating ? "Generating Quiz..." : "Generate Quiz"}
        </Button>
      </CardContent>
    </Card>
  )
}