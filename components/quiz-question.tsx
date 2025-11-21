"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"

interface Option {
  id: string
  text: string
}

interface QuizQuestionProps {
  questionNumber: number
  totalQuestions: number
  question: string
  options: Option[]
  correctOptionId: string
  onAnswer?: (optionId: string) => void
}

export function QuizQuestion({
  questionNumber,
  totalQuestions,
  question,
  options,
  correctOptionId,
  onAnswer,
}: QuizQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleSelect = (optionId: string) => {
    if (!answered) {
      setSelectedOption(optionId)
    }
  }

  const handleSubmit = () => {
    if (selectedOption) {
      setAnswered(true)
      onAnswer?.(selectedOption)
    }
  }

  const isCorrect = selectedOption === correctOptionId

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <Card className="border-0 shadow-md bg-primary/5 border-l-4 border-l-primary">
        <CardContent className="p-6">
          <p className="text-lg font-semibold text-foreground">{question}</p>
        </CardContent>
      </Card>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedOption === option.id
          const showCorrect = answered && isSelected && isCorrect
          const showIncorrect = answered && isSelected && !isCorrect
          const showCorrectAnswer = answered && option.id === correctOptionId && !isCorrect

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={answered}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                showCorrect
                  ? "border-green-500 bg-green-50 text-foreground"
                  : showIncorrect
                    ? "border-red-500 bg-red-50 text-foreground"
                    : showCorrectAnswer
                      ? "border-green-500 bg-green-50 text-foreground"
                      : isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card hover:border-primary/50 text-foreground hover:bg-muted/30 disabled:cursor-default"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-base">{option.text}</span>
                {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
                {showIncorrect && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                {showCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <Card className={`border-0 ${isCorrect ? "bg-green-50" : "bg-red-50"}`}>
          <CardContent className="p-4">
            <p className={`text-sm font-medium ${isCorrect ? "text-green-700" : "text-red-700"}`}>
              {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isCorrect
                ? "Great job! You got this one right."
                : "This is an opportunity to learn. Review the material and try again."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      {!answered && (
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className="w-full h-11 rounded-lg text-base font-semibold bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Answer
        </Button>
      )}

      {answered && (
        <Button variant="outline" className="w-full h-11 rounded-lg text-base font-semibold bg-transparent">
          Next Question
        </Button>
      )}
    </div>
  )
}
