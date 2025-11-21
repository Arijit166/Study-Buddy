"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface QuizSetupProps {
  onGenerate?: () => void
}

export function QuizSetup({ onGenerate }: QuizSetupProps) {
  return (
    <Card className="border-0 shadow-md max-w-2xl">
      <CardHeader>
        <CardTitle>Generate Quiz</CardTitle>
        <CardDescription>Customize your quiz settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Topic Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Select Topic or Notes</Label>
          <Select>
            <SelectTrigger className="rounded-lg h-11">
              <SelectValue placeholder="Choose a topic or uploaded notes..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="photosynthesis">Photosynthesis</SelectItem>
              <SelectItem value="cells">Cell Biology</SelectItem>
              <SelectItem value="genetics">Genetics Basics</SelectItem>
              <SelectItem value="enzymes">Enzymes & ATP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Question Count */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Number of Questions</Label>
          <Select defaultValue="10">
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
          <RadioGroup defaultValue="medium">
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
              <input type="checkbox" id="mcq" defaultChecked className="w-4 h-4 rounded" />
              <Label htmlFor="mcq" className="font-normal cursor-pointer">
                Multiple Choice
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="true-false" defaultChecked className="w-4 h-4 rounded" />
              <Label htmlFor="true-false" className="font-normal cursor-pointer">
                True/False
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="short-answer" className="w-4 h-4 rounded" />
              <Label htmlFor="short-answer" className="font-normal cursor-pointer">
                Short Answer
              </Label>
            </div>
          </div>
        </div>

        {/* Notes/Instructions */}
        <div className="space-y-3">
          <Label htmlFor="notes" className="text-base font-semibold">
            Additional Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Any specific areas to focus on or concepts to avoid..."
            className="resize-none rounded-lg border-input focus:ring-2 focus:ring-primary/50 min-h-20"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={onGenerate}
          className="w-full h-12 rounded-lg text-base font-semibold bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200"
        >
          Generate Quiz
        </Button>
      </CardContent>
    </Card>
  )
}
