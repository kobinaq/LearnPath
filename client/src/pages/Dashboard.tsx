import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, BookOpen, Trophy, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Active Paths",
      value: "3",
      description: "Learning paths in progress",
      icon: BookOpen,
    },
    {
      title: "Completed",
      value: "12",
      description: "Topics mastered",
      icon: Trophy,
    },
    {
      title: "Study Time",
      value: "24h",
      description: "This week",
      icon: Clock,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={() => navigate("/paths/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Learning Path
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}