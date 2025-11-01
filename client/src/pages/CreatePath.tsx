import { useState, useEffect } from "react"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createLearningPath } from "@/api/learning-paths"
import { subscriptionApi } from "@/api/subscriptions"
import { useToast } from "@/hooks/useToast"
import { X, Zap, AlertCircle, Sparkles } from "lucide-react"

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
  const [subscription, setSubscription] = useState<any>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { control, register, handleSubmit } = useForm<FormData>()

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      const subData = await subscriptionApi.getCurrentSubscription()
      setSubscription(subData)
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoadingSubscription(false)
    }
  }

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

      // Check credits before creating
      if (subscription && subscription.credits < 1) {
        toast({
          variant: "destructive",
          title: "Insufficient Credits",
          description: "You don't have enough credits. Please upgrade your plan.",
        })
        navigate('/pricing')
        return
      }

      await createLearningPath({
        ...data,
        pace: data.pace.toLowerCase(),
        goals: filteredGoals,
      })
      toast({
        title: "Success",
        description: "Learning path created successfully! Generate course content to unlock AI-powered resources.",
      })
      navigate("/paths")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create learning path",
      })
    } finally {
      setLoading(false)
    }
  }

  const hasEnoughCredits = subscription ? subscription.credits >= 1 : true

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Credit Usage Info */}
      {!loadingSubscription && subscription && (
        <Alert className={hasEnoughCredits ? "border-blue-500 bg-blue-50" : "border-red-500 bg-red-50"}>
          <Zap className={`h-4 w-4 ${hasEnoughCredits ? 'text-blue-600' : 'text-red-600'}`} />
          <AlertDescription className="ml-2">
            {hasEnoughCredits ? (
              <div>
                <strong>Credits Available:</strong> {subscription.credits} credits remaining
                <p className="text-sm mt-1 text-muted-foreground">
                  After creating a path, use 1 credit to generate AI-powered course content with YouTube videos and articles.
                </p>
              </div>
            ) : (
              <div>
                <strong>No Credits Available</strong>
                <p className="text-sm mt-1">
                  You need credits to generate AI course content.
                  <Button variant="link" className="p-0 h-auto ml-1" onClick={() => navigate('/pricing')}>
                    Upgrade your plan
                  </Button>
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Create Learning Path
          </CardTitle>
          <CardDescription>
            Set up your learning path with topic, level, and goals. Then generate AI-powered course content!
          </CardDescription>
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