import { X } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"

interface GoalsInputProps {
  goals: string[]
  onChange: (goals: string[]) => void
}

export function GoalsInput({ goals, onChange }: GoalsInputProps) {
  const addGoal = () => {
    onChange([...goals, ""])
  }

  const removeGoal = (index: number) => {
    const newGoals = goals.filter((_, i) => i !== index)
    onChange(newGoals)
  }

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...goals]
    newGoals[index] = value
    onChange(newGoals)
  }

  return (
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
  )
}