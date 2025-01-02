import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PlusCircle, ArrowRight } from "lucide-react"
import { getLearningPath } from "@/api/learning-paths"

type LearningPath = {
  id: string
  topic: string
  level: string
  pace: string
  progress: number
}

export function LearningPaths() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    // Mock multiple learning paths
    Promise.all([
      getLearningPath("1"),
      getLearningPath("2"),
      getLearningPath("3")
    ]).then((results) => {
      setPaths(results as LearningPath[])
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Learning Paths</h1>
        <Button onClick={() => navigate("/paths/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Path
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paths.map((path) => (
          <Card key={path.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{path.topic}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Level</div>
                  <div className="text-sm text-muted-foreground">{path.level}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Pace</div>
                  <div className="text-sm text-muted-foreground">{path.pace}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Progress</div>
                  <Progress value={path.progress} />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/paths/${path.id}`)}
                >
                  Continue Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}