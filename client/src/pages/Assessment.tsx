import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { getAssessment } from "@/api/progress"
import { useToast } from "@/hooks/useToast"

type Question = {
  id: string
  question: string
  options: string[]
  correct: number
}

export function Assessment() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const { toast } = useToast()

  useEffect(() => {
    const fetchAssessment = async () => {
      const response = await getAssessment("1") as { questions: Question[] };
      setQuestions(response.questions)
    }
    fetchAssessment()
  }, [])

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleSubmit = () => {
    const score = questions.reduce((acc, question) => {
      return acc + (selectedAnswers[question.id] === question.correct ? 1 : 0)
    }, 0)

    toast({
      title: "Assessment Complete",
      description: `You scored ${score} out of ${questions.length}`,
    })
  }

  if (!questions.length) return null

  const question = questions[currentQuestion]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          
          <div className="text-xl">{question.question}</div>

          <RadioGroup
            value={selectedAnswers[question.id]?.toString()}
            onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            {currentQuestion === questions.length - 1 ? (
              <Button onClick={handleSubmit}>Submit</Button>
            ) : (
              <Button onClick={() => setCurrentQuestion(prev => prev + 1)}>
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}