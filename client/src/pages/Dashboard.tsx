import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, BookOpen, CreditCard, Zap, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { subscriptionApi } from '@/api/subscriptions';
import { getAllLearningPaths } from '@/api/learning-paths';
import { toast } from 'sonner';

export function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [subData, pathsData] = await Promise.all([
        subscriptionApi.getCurrentSubscription(),
        getAllLearningPaths(),
      ]);
      setSubscription(subData);
      setLearningPaths(pathsData);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const usagePercentage = subscription
    ? Math.round((subscription.creditsUsed / subscription.planDetails.credits) * 100)
    : 0;

  const activePaths = learningPaths.filter(p => p.progress < 100).length;
  const completedPaths = learningPaths.filter(p => p.progress === 100).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Continue your learning journey.
          </p>
        </div>
        <Button onClick={() => navigate("/paths/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Learning Path
        </Button>
      </div>

      {/* Subscription Status Card */}
      <Card className="border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Your Subscription
              </CardTitle>
              <CardDescription className="mt-2">
                <Badge variant="secondary" className="uppercase">
                  {subscription?.planDetails?.name || 'Free'} Plan
                </Badge>
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/pricing')}>
              Upgrade Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Credits Usage</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {subscription?.credits || 0} / {subscription?.planDetails?.credits || 5} remaining
              </span>
            </div>
            <Progress value={100 - usagePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {subscription?.creditsUsed || 0} course generations used this month
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Paths
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePaths}</div>
            <p className="text-xs text-muted-foreground">Learning paths in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Completed
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPaths}</div>
            <p className="text-xs text-muted-foreground">Paths completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Paths
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningPaths.length}</div>
            <p className="text-xs text-muted-foreground">All learning paths</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {learningPaths.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create your first learning path to begin your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/paths/new')} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Learning Path
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}