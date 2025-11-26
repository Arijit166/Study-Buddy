"use client"

import { Button } from "@/components/ui/button"
import { Calendar, BookOpen, Target, ArrowLeft, Download } from "lucide-react"

interface StudyPlanDisplayProps {
  studyPlan: {
    topic: string
    startDate: string
    endDate: string
    studyPlan: {
      overview: string
      dailySchedule: Array<{
        day: number
        date: string
        topics: string[]
        activities: string[]
        duration: string
      }>
      milestones: string[]
      tips: string[]
    }
    mindmap: {
      central: string
      branches: Array<{
        name: string
        subbranches: string[]
      }>
    }
  }
  onNewPlan: () => void
}

export function StudyPlanDisplay({ studyPlan, onNewPlan }: StudyPlanDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
  }

  const downloadPlan = () => {
    const content = `
STUDY PLAN: ${studyPlan.topic}
Duration: ${formatDate(studyPlan.startDate)} - ${formatDate(studyPlan.endDate)}

OVERVIEW
${studyPlan.studyPlan.overview}

DAILY SCHEDULE
${studyPlan.studyPlan.dailySchedule.map(day => `
Day ${day.day} - ${day.date}
Topics: ${day.topics.join(', ')}
Activities: ${day.activities.join(', ')}
Duration: ${day.duration}
`).join('\n')}

MILESTONES
${studyPlan.studyPlan.milestones.map((m, i) => `${i + 1}. ${m}`).join('\n')}

TIPS FOR SUCCESS
${studyPlan.studyPlan.tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}
    `

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `study-plan-${studyPlan.topic.replace(/\s+/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onNewPlan}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Create New Plan
        </Button>
        <Button
          onClick={downloadPlan}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download Plan
        </Button>
      </div>

      {/* Title Card */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{studyPlan.topic}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(studyPlan.startDate)}</span>
          </div>
          <span>→</span>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(studyPlan.endDate)}</span>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Overview
        </h2>
        <p className="text-foreground leading-relaxed">{studyPlan.studyPlan.overview}</p>
      </div>

      {/* Mind Map */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Concept Mind Map</h2>
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-lg">
              {studyPlan.mindmap.central}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {studyPlan.mindmap.branches.map((branch, idx) => (
              <div key={idx} className="border border-border rounded-lg p-4 bg-accent/20">
                <h3 className="font-semibold text-foreground mb-3 pb-2 border-b border-border">
                  {branch.name}
                </h3>
                <ul className="space-y-2">
                  {branch.subbranches.map((sub, subIdx) => (
                    <li key={subIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{sub}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Schedule */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Daily Schedule
        </h2>
        <div className="space-y-4">
          {studyPlan.studyPlan.dailySchedule.map((day) => (
            <div key={day.day} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">Day {day.day}</h3>
                  <p className="text-sm text-muted-foreground">{day.date}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {day.duration}
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Topics:</h4>
                  <div className="flex flex-wrap gap-2">
                    {day.topics.map((topic, idx) => (
                      <span key={idx} className="text-sm px-3 py-1 bg-accent rounded-full text-foreground">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Activities:</h4>
                  <ul className="space-y-1">
                    {day.activities.map((activity, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Key Milestones
        </h2>
        <div className="space-y-3">
          {studyPlan.studyPlan.milestones.map((milestone, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-foreground">{milestone}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Study Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {studyPlan.studyPlan.tips.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-2 p-3 bg-accent/30 rounded-lg">
              <span className="text-primary font-semibold">💡</span>
              <p className="text-sm text-foreground">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}