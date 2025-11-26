"use client"

import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { StudyPlanForm } from "@/components/study-plan-form"
import { StudyPlanDisplay } from "@/components/study-plan-display"
import { useUser } from "@/hooks/use-user"
import { useState } from "react"

export default function StudyPlanPage() {
  const { user, loading } = useUser()
  const [studyPlan, setStudyPlan] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePlan = async (formData: {
    topic: string
    startDate: string
    endDate: string
    selectedNotes: string[]
  }) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/study-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate study plan')
      }

      const data = await response.json()
      setStudyPlan(data)
    } catch (error) {
      console.error('Error generating study plan:', error)
      alert('Failed to generate study plan. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar 
          title="Study Plan"
          userName={user?.name}
          userAvatar={user?.avatar}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {!studyPlan ? (
              <StudyPlanForm 
                onGenerate={handleGeneratePlan}
                isGenerating={isGenerating}
              />
            ) : (
              <StudyPlanDisplay 
                studyPlan={studyPlan}
                onNewPlan={() => setStudyPlan(null)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}