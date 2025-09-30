import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Heart, 
  Brain, 
  Activity, 
  TrendingUp, 
  Calendar, 
  Clock,
  Plus,
  MessageCircle,
  Target,
  Award
} from "lucide-react";

interface DashboardPageProps {
  onBack: () => void;
}

export function DashboardPageSimple({ onBack }: DashboardPageProps) {
  const [currentMood, setCurrentMood] = useState(7);

  // Mock data - in a real app this would come from the backend
  const mockData = {
    mood: {
      current: currentMood,
      trend: "improving",
      weeklyAverage: 6.5
    },
    energy: {
      current: 6,
      trend: "stable"
    },
    stress: {
      current: 4,
      trend: "decreasing"
    },
    activities: [
      {
        id: 1,
        type: "chat",
        title: "AI Assistant Chat",
        description: "Discussed anxiety management strategies",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        category: "support"
      },
      {
        id: 2,
        type: "assessment",
        title: "Mental Health Check-in",
        description: "Completed weekly assessment",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        category: "assessment"
      }
    ],
    tasks: [
      {
        id: 1,
        title: "Weekly Mental Health Check-in",
        description: "Take your weekly assessment to track progress",
        dueDate: "Today",
        priority: "high",
        completed: false
      },
      {
        id: 2,
        title: "Practice Mindfulness",
        description: "Daily 10-minute meditation session",
        dueDate: "Today",
        priority: "medium",
        completed: false
      }
    ],
    achievements: [
      {
        id: 1,
        title: "First Chat Session",
        description: "Completed your first AI assistant conversation",
        earned: true,
        date: new Date()
      },
      {
        id: 2,
        title: "Weekly Check-in Streak",
        description: "Complete 7 consecutive weekly check-ins",
        earned: false,
        progress: 1,
        total: 7
      }
    ]
  };

  const updateMood = (value: number) => {
    setCurrentMood(value);
    // In a real app, this would save to backend
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Mental Health Dashboard</h1>
              </div>
            </div>
            <Badge variant="outline">Offline Mode</Badge>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Mood</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockData.mood.current}/10</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {mockData.mood.trend}
                    </Badge>
                    <Progress value={mockData.mood.current * 10} className="flex-1" />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 w-full"
                    onClick={() => updateMood(Math.floor(Math.random() * 10) + 1)}
                  >
                    Update Check-in
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Energy Level</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockData.energy.current}/10</div>
                  <Progress value={mockData.energy.current * 10} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Trend: {mockData.energy.trend}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stress Level</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockData.stress.current}/10</div>
                  <Progress value={mockData.stress.current * 10} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Trend: {mockData.stress.trend}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Upcoming Tasks
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockData.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {task.completed ? 'Completed' : 'Mark Done'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progress Overview
                </CardTitle>
                <CardDescription>
                  Track your mental health journey over time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Weekly Mood Average</label>
                    <div className="text-2xl font-bold">{mockData.mood.weeklyAverage}/10</div>
                    <Progress value={mockData.mood.weeklyAverage * 10} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sessions Completed</label>
                    <div className="text-2xl font-bold">3</div>
                    <Progress value={30} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockData.activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.category}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  Celebrate your mental health milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockData.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${achievement.earned ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <Award className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {!achievement.earned && achievement.progress && (
                        <div className="mt-2">
                          <Progress value={(achievement.progress / achievement.total!) * 100} />
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.progress}/{achievement.total}
                          </p>
                        </div>
                      )}
                    </div>
                    {achievement.earned && (
                      <Badge className="text-xs">Earned</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}