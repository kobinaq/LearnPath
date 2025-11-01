import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, ArrowRight, Sparkles, Loader2, Video, FileText, ExternalLink } from "lucide-react"
import { getAllLearningPaths, generateCourse, LearningPath } from "@/api/learning-paths"
import { toast } from "sonner"

export function LearningPaths() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadPaths()
  }, [])

  const loadPaths = async () => {
    try {
      setLoading(true)
      const data = await getAllLearningPaths()
      setPaths(data)
    } catch (error: any) {
      console.error('Error loading paths:', error)
      toast.error('Failed to load learning paths')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCourse = async (pathId: string) => {
    try {
      setGenerating(pathId)
      const result = await generateCourse(pathId)
      toast.success(result.message || 'Course generated successfully!')

      // Reload paths to show updated data
      await loadPaths()
    } catch (error: any) {
      console.error('Error generating course:', error)

      if (error.response?.status === 402) {
        toast.error('Insufficient credits. Please upgrade your plan.')
        navigate('/pricing')
      } else {
        toast.error(error.message || 'Failed to generate course')
      }
    } finally {
      setGenerating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Paths</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your personalized learning journeys
          </p>
        </div>
        <Button onClick={() => navigate("/paths/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Path
        </Button>
      </div>

      {paths.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Learning Paths Yet</CardTitle>
            <CardDescription>
              Create your first learning path to start your personalized learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/paths/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Path
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paths.map((path) => {
            const hasCourseData = path.courseData && Object.keys(path.courseData).length > 0
            const hasResources = path.resources && path.resources.length > 0
            const pathId = path._id || path.id || ''

            return (
              <Card key={pathId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{path.topic}</CardTitle>
                    {hasCourseData && (
                      <Badge variant="secondary">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="font-medium">Level</div>
                        <div className="text-muted-foreground truncate">{path.level}</div>
                      </div>
                      <div>
                        <div className="font-medium">Pace</div>
                        <div className="text-muted-foreground capitalize">{path.pace}</div>
                      </div>
                    </div>

                    {hasResources && (
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          {path.resources?.filter(r => r.type === 'video').length || 0} videos
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {path.resources?.filter(r => r.type === 'article').length || 0} articles
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Progress</div>
                      <Progress value={path.progress} />
                      <div className="text-xs text-muted-foreground text-right">
                        {path.progress}%
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!hasCourseData ? (
                        <Button
                          variant="default"
                          className="w-full"
                          onClick={() => handleGenerateCourse(pathId)}
                          disabled={generating !== null}
                        >
                          {generating === pathId ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Course (1 credit)
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/paths/${pathId}`)}
                        >
                          View Course
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}