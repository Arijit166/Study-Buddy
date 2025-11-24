"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react"

interface QuizQuestion {
  question: string
  type: 'mcq' | 'true-false' | 'short-answer'
  options?: string[]
  correctAnswer: string
  userAnswer?: string
  isCorrect?: boolean
}

interface QuizPlayProps {
  quizId: string
  questions: QuizQuestion[]
  onComplete?: () => void
}

export default function QuizPlay({ quizId, questions, onComplete }: QuizPlayProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{ answer: string }[]>(
    Array(questions.length).fill({ answer: "" })
  )
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [shortAnswer, setShortAnswer] = useState("")
  const [answered, setAnswered] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  const handleSelectOption = (option: string) => {
    if (!answered) {
      setSelectedOption(option)
    }
  }
  const handleSubmitAnswer = () => {
    if (!selectedOption && !shortAnswer) return

    const answer = currentQuestion.type === 'short-answer' ? shortAnswer : selectedOption
    
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = { answer }
    setUserAnswers(newAnswers)
    setAnswered(true)
  }

  const handleNextQuestion = () => {
    // Move to next question or submit
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedOption("")
      setShortAnswer("")
      setAnswered(false)
    } else {
      // This is the last question, submit the quiz
      submitQuiz()
    }
  }

  const submitQuiz = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: userAnswers }),
      })

      if (res.ok) {
        const data = await res.json()
        setResults(data)
        setQuizCompleted(true)
      }
    } catch (error) {
      console.error("Quiz submission error:", error)
      alert("Failed to submit quiz. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitting) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg text-muted-foreground">Grading your quiz...</p>
      </div>
    )
  }

  if (quizCompleted && results) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Score Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
            <div className="text-6xl font-bold text-primary my-4">
              {results.score}%
            </div>
            <p className="text-lg text-muted-foreground">
              You got {results.correctCount} out of {results.totalQuestions} questions correct
            </p>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-bold mb-4">Review Your Answers</h3>
            
            {results.questions.map((q: QuizQuestion, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  q.isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  {q.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold mb-2">Q{index + 1}: {q.question}</p>
                    
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Your Answer: </span>
                        <span className={q.isCorrect ? "text-green-700" : "text-red-700"}>
                          {q.userAnswer || "Not answered"}
                        </span>
                      </p>
                      
                      {!q.isCorrect && (
                        <p>
                          <span className="font-medium">Correct Answer: </span>
                          <span className="text-green-700">{q.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex-1 h-12"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Quiz
          </Button>
          <Button
            onClick={onComplete}
            className="flex-1 h-12"
          >
            View History
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <Card className="border-0 shadow-md bg-primary/5 border-l-4 border-l-primary">
        <CardContent className="p-6">
          <p className="text-lg font-semibold text-foreground">{currentQuestion.question}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Type: {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 
                   currentQuestion.type === 'true-false' ? 'True/False' : 'Short Answer'}
          </p>
        </CardContent>
      </Card>

      {/* Answer Options */}
      {(currentQuestion.type === 'mcq' || currentQuestion.type === 'true-false') && currentQuestion.options && (
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === option

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                disabled={answered}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card hover:border-primary/50 text-foreground hover:bg-muted/30 disabled:cursor-default"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base">{option}</span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Short Answer Input */}
      {currentQuestion.type === 'short-answer' && (
        <div className="space-y-3">
          <Input
            value={shortAnswer}
            onChange={(e) => setShortAnswer(e.target.value)}
            placeholder="Type your answer here..."
            disabled={answered}
            className="h-12 rounded-lg text-base"
          />
        </div>
      )}

      {/* Submit/Next Button */}
      {!answered ? (
        <Button
          onClick={handleSubmitAnswer}
          disabled={!selectedOption && !shortAnswer}
          className="w-full h-11 rounded-lg text-base font-semibold bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Answer
        </Button>
      ) : (
        <Button
          onClick={handleNextQuestion}
          className="w-full h-11 rounded-lg text-base font-semibold bg-primary hover:bg-primary/90"
        >
          {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
        </Button>
      )}
    </div>
  )
}