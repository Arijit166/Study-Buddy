"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Clock, TrendingUp } from "lucide-react"
import QuizSetup from "@/components/quiz-setup"
import QuizPlay from "@/components/quiz-question"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { useUser } from "@/hooks/use-user"

interface QuizConfig {
  topic: string
  sourceType: 'note' | 'flashcard' | 'ai-generated'
  sourceId?: string
  questionCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  questionTypes: string[]
  customNotes?: string
}

interface QuizHistory {
  id: string
  topic: string
  score: number
  totalQuestions: number
  difficulty: string
  completedAt: string
  sourceType: string
}

export default function QuizzesPage() {
  const [view, setView] = useState<'setup' | 'play' | 'history'>('setup')
  const [currentQuiz, setCurrentQuiz] = useState<any>(null)
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    if (view === 'history') {
      fetchQuizHistory()
    }
  }, [view])

  const fetchQuizHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch('/api/quiz/history')
      if (res.ok) {
        const data = await res.json()
        setQuizHistory(data.quizzes || [])
      }
    } catch (error) {
      console.error("Failed to fetch quiz history:", error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleGenerate = async (config: QuizConfig) => {
    setLoading(true)
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (res.ok) {
        const data = await res.json()
        setCurrentQuiz(data)
        setView('play')
      } else {
        const error = await res.json()
        alert(error.error || "Failed to generate quiz")
      }
    } catch (error) {
      console.error("Quiz generation error:", error)
      alert("Failed to generate quiz. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    setView('history')
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar
          title={`Quizzes`}
          userName={user?.name}
          userAvatar={user?.avatar}
        />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 max-w-6xl">
            {/* Your existing content starts here */}
            <div className="mb-8">
              <p className="text-2xl font-bold text-foreground mb-2">
                Test your knowledge with AI-generated quizzes
              </p>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 mb-6">
              <Button
                variant={view === 'setup' ? 'default' : 'outline'}
                onClick={() => setView('setup')}
              >
                New Quiz
              </Button>
              <Button
                variant={view === 'history' ? 'default' : 'outline'}
                onClick={() => setView('history')}
              >
                History
              </Button>
            </div>

            {/* Views */}
            {view === 'setup' && !loading && (
              <QuizSetup onGenerate={handleGenerate} />
            )}

            {loading && (
              <div className="max-w-2xl mx-auto text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg text-muted-foreground">
                  Generating your quiz using AI...
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  This may take up to 30 seconds
                </p>
              </div>
            )}

            {view === 'play' && currentQuiz && (
              <QuizPlay
                quizId={currentQuiz.quizId}
                questions={currentQuiz.questions}
                onComplete={handleComplete}
              />
            )}

            {view === 'history' && (
              <div className="space-y-4">
                {historyLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading history...</p>
                  </div>
                ) : quizHistory.length === 0 ? (
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-12 text-center">
                      <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No quizzes yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start by creating your first quiz!
                      </p>
                      <Button onClick={() => setView('setup')}>
                        Create Quiz
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="border-0 shadow-md">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Quizzes</p>
                              <p className="text-2xl font-bold">{quizHistory.length}</p>
                            </div>
                            <Trophy className="w-8 h-8 text-primary" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-md">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Average Score</p>
                              <p className="text-2xl font-bold">
                                {Math.round(
                                  quizHistory.reduce((sum, q) => sum + q.score, 0) / quizHistory.length
                                )}%
                              </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-md">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Questions Answered</p>
                              <p className="text-2xl font-bold">
                                {quizHistory.reduce((sum, q) => sum + q.totalQuestions, 0)}
                              </p>
                            </div>
                            <Clock className="w-8 h-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-3">
                      {quizHistory.map((quiz) => (
                        <Card key={quiz.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">{quiz.topic}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="capitalize">{quiz.difficulty}</span>
                                  <span>•</span>
                                  <span>{quiz.totalQuestions} questions</span>
                                  <span>•</span>
                                  <span>{new Date(quiz.completedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-3xl font-bold ${
                                  quiz.score >= 80 ? 'text-green-500' :
                                  quiz.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                                }`}>
                                  {quiz.score}%
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {quiz.sourceType === 'note' ? 'From Note' :
                                  quiz.sourceType === 'flashcard' ? 'From Flashcards' :
                                  'AI Generated'}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
                </div>
            )}
        </div>
      </main>
    </div>
  </div>
  )
}