import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createLearningPath } from "@/api/learning-paths"
import { useToast } from "@/hooks/useToast"
import { X } from "lucide-react"

type FormData = {
  topic: string
  level: string
  pace: string
  goals: string[]
}

const educationLevels = [
  "Elementary/Primary Level",
  "Middle School Level",
  "High School Level",
  "Undergraduate/Tertiary Level",
  "Postgraduate Level",
  "Professional/Continuing Education"
]

const paceLevels = [
  "Self-paced",
  "Intensive",
  "Casual"
]

export function CreatePath() {
  const [loading, setLoading] = useState(false)
  const [goals, setGoals] = useState<string[]>([])
  const { toast } = useToast()
  const navigate = useNavigate()
  const { control, register, handleSubmit } = useForm<FormData>()

  const addGoal = () => {
    setGoals([...goals, ""])
  }

  const removeGoal = (index: number) => {
    const newGoals = goals.filter((_, i) => i !== index)
    setGoals(newGoals)
  }

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...goals]
    newGoals[index] = value
    setGoals(newGoals)
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      const filteredGoals = goals.filter(goal => goal.trim() !== '')
      if (filteredGoals.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please add at least one goal",
        })
        return
      }
      await createLearningPath({
        ...data,
        goals: filteredGoals,
      })
      toast({
        title: "Success",
        description: "Learning path created successfully",
      })
      navigate("/paths")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create learning path",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Learning Path</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="Enter the topic you want to learn"
                {...register("topic", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Educational Level</Label>
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pace">Learning Pace</Label>
              <Controller
                name="pace"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pace" />
                    </SelectTrigger>
                    <SelectContent>
                      {paceLevels.map((pace) => (
                        <SelectItem key={pace} value={pace}>
                          {pace}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Learning Goals</Label>
              <div className="space-y-2">
                {goals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={goal}
                      onChange={(e) => updateGoal(index, e.target.value)}
                      placeholder={`Goal ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeGoal(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={addGoal}
                >
                  Add Goal
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Learning Path"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}