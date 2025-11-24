"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { useUser } from "@/hooks/use-user"
import { QuizSetup } from "@/components/quiz-setup"
import { QuizQuestion } from "@/components/quiz-question"

const sampleQuestions = [
  {
    id: 1,
    question: "What is the primary function of chlorophyll in photosynthesis?",
    options: [
      { id: "a", text: "To store glucose molecules" },
      { id: "b", text: "To absorb light energy and transfer electrons" },
      { id: "c", text: "To produce carbon dioxide" },
      { id: "d", text: "To break down water molecules" },
    ],
    correct: "b",
  },
  {
    id: 2,
    question: "Which organelle is responsible for producing ATP in plant cells?",
    options: [
      { id: "a", text: "Chloroplast" },
      { id: "b", text: "Nucleus" },
      { id: "c", text: "Mitochondria" },
      { id: "d", text: "Ribosome" },
    ],
    correct: "c",
  },
]

export default function QuizzesPage() {
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const { user } = useUser()
  if (quizStarted) {
    const currentQ = sampleQuestions[currentQuestionIndex]

    return (
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar title="Quiz - Biology Fundamentals"
            userName={user?.name}
            userAvatar={user?.avatar}
          />
          <main className="flex-1 overflow-auto p-8">
            <QuizQuestion
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={sampleQuestions.length}
              question={currentQ.question}
              options={currentQ.options}
              correctOptionId={currentQ.correct}
              onAnswer={() => {
                if (currentQuestionIndex < sampleQuestions.length - 1) {
                  setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 500)
                }
              }}
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
        <TopNavbar title="Quizzes" 
          userName={user?.name}
          userAvatar={user?.avatar}
        />
        <main className="flex-1 overflow-auto p-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Create a New Quiz</h2>
              <p className="text-muted-foreground">Test your knowledge with AI-generated quizzes based on your notes</p>
            </div>

            <QuizSetup onGenerate={() => setQuizStarted(true)} />
          </div>
        </main>
      </div>
    </div>
  )
}
