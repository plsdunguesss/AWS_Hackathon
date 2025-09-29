import { useState } from "react";
import { ArrowLeft, MessageCircle, TrendingUp, Calendar, Settings, Bell, Heart, Brain, Users, Award, Plus, BarChart3, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";

interface DashboardPageProps {
  onBack: () => void;
  onStartChat: () => void;
  onViewResources: () => void;
  onStartAssessment: () => void;
  onViewProfessionals: () => void;
  onViewProgress?: () => void;
  onViewSettings?: () => void;
}

const recentActivities = [
  {
    id: '1',
    type: 'chat',
    title: 'AI Assistant Chat',
    description: 'Discussed anxiety management strategies',
    timestamp: '2 hours ago',
    icon: MessageCircle
  },
  {
    id: '2',
    type: 'assessment',
    title: 'Mental Health Check-in',
    description: 'Completed weekly assessment',
    timestamp: '1 day ago',
    icon: BarChart3
  },
  {
    id: '3',
    type: 'resource',
    title: 'Mindfulness Exercise',
    description: 'Completed 10-minute breathing exercise',
    timestamp: '2 days ago',
    icon: Heart
  },
  {
    id: '4',
    type: 'professional',
    title: 'Therapist Consultation',
    description: 'Scheduled appointment with Dr. Smith',
    timestamp: '3 days ago',
    icon: Users
  }
];

const upcomingTasks = [
  {
    id: '1',
    title: 'Weekly Mental Health Check-in',
    description: 'Take your weekly assessment to track progress',
    dueDate: 'Today',
    priority: 'high' as const,
    icon: BarChart3
  },
  {
    id: '2',
    title: 'Practice Mindfulness',
    description: 'Daily 10-minute meditation session',
    dueDate: 'Today',
    priority: 'medium' as const,
    icon: Heart
  },
  {
    id: '3',
    title: 'Journal Reflection',
    description: 'Write about your mood and experiences',
    dueDate: 'Tomorrow',
    priority: 'low' as const,
    icon: Brain
  },
  {
    id: '4',
    title: 'Dr. Smith Appointment',
    description: 'Therapy session at 2:00 PM',
    dueDate: 'Thursday',
    priority: 'high' as const,
    icon: Calendar
  }
];

const moodData = [
  { date: '2024-01-01', mood: 7, energy: 6, stress: 4 },
  { date: '2024-01-02', mood: 6, energy: 5, stress: 5 },
  { date: '2024-01-03', mood: 8, energy: 7, stress: 3 },
  { date: '2024-01-04', mood: 7, energy: 6, stress: 4 },
  { date: '2024-01-05', mood: 9, energy: 8, stress: 2 },
  { date: '2024-01-06', mood: 8, energy: 7, stress: 3 },
  { date: '2024-01-07', mood: 7, energy: 6, stress: 4 }
];

const achievements = [
  {
    id: '1',
    title: '7-Day Streak',
    description: 'Completed daily check-ins for a week',
    earned: true,
    icon: Award,
    color: 'text-yellow-600'
  },
  {
    id: '2',
    title: 'Mindfulness Master',
    description: 'Completed 10 mindfulness exercises',
    earned: true,
    icon: Heart,
    color: 'text-green-600'
  },
  {
    id: '3',
    title: 'Assessment Champion',
    description: 'Completed first mental health assessment',
    earned: true,
    icon: BarChart3,
    color: 'text-blue-600'
  },
  {
    id: '4',
    title: 'Support Seeker',
    description: 'Connected with a mental health professional',
    earned: false,
    icon: Users,
    color: 'text-gray-400'
  }
];

export function DashboardPage({ 
  onBack, 
  onStartChat, 
  onViewResources, 
  onStartAssessment,
  onViewProfessionals,
  onViewProgress,
  onViewSettings
}: DashboardPageProps) {
  const [selectedTab, setSelectedTab] = useState('overview');

  const currentMood = moodData[moodData.length - 1];
  const averageMood = Math.round(moodData.reduce((acc, day) => acc + day.mood, 0) / moodData.length);
  const moodTrend = currentMood.mood > moodData[moodData.length - 2]?.mood ? 'up' : 'down';

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-border bg-card';
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl">Welcome back, Sarah!</h1>
                <p className="text-muted-foreground">Here's your mental health journey overview</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onViewSettings}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onStartChat}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">AI Chat</h3>
                    <p className="text-sm text-muted-foreground">Talk to your assistant</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onStartAssessment}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Check-in</h3>
                    <p className="text-sm text-muted-foreground">Track your mood</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onViewResources}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Resources</h3>
                    <p className="text-sm text-muted-foreground">Self-help tools</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onViewProfessionals}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Find Help</h3>
                    <p className="text-sm text-muted-foreground">Connect with pros</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Current Mood */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Current Mood</h3>
                  <Badge variant={moodTrend === 'up' ? 'default' : 'secondary'}>
                    {moodTrend === 'up' ? '↗ Improving' : '↘ Stable'}
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Mood</span>
                      <span>{currentMood.mood}/10</span>
                    </div>
                    <Progress value={currentMood.mood * 10} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Energy</span>
                      <span>{currentMood.energy}/10</span>
                    </div>
                    <Progress value={currentMood.energy * 10} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Stress Level</span>
                      <span>{currentMood.stress}/10</span>
                    </div>
                    <Progress value={currentMood.stress * 10} className="h-2 [&>div]:bg-red-500" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={onStartAssessment}>
                  Update Check-in
                </Button>
              </Card>

              {/* Upcoming Tasks */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Upcoming Tasks</h3>
                  <Button variant="ghost" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {upcomingTasks.slice(0, 3).map((task) => {
                    const Icon = task.icon;
                    return (
                      <div key={task.id} className={`p-3 rounded-lg border-l-4 ${getPriorityColor(task.priority)}`}>
                        <div className="flex items-start gap-3">
                          <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{task.dueDate}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All Tasks
                </Button>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <h3 className="font-medium mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivities.slice(0, 3).map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={onViewProgress}>
                  View Detailed Progress
                </Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-medium mb-4">7-Day Mood Trend</h3>
                <div className="space-y-4">
                  {moodData.slice(-7).map((day, index) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <div className="w-16 text-sm text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                      </div>
                      <div className="flex-1">
                        <Progress value={day.mood * 10} className="h-2" />
                      </div>
                      <div className="w-8 text-sm font-medium">{day.mood}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Average mood this week:</span> {averageMood}/10
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-medium mb-4">Wellness Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Daily Check-ins</span>
                    <Badge>7/7 days</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mindfulness Sessions</span>
                    <Badge variant="secondary">5 this week</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Chat Sessions</span>
                    <Badge variant="secondary">3 conversations</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Resources Accessed</span>
                    <Badge variant="secondary">8 resources</Badge>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-4">All Activities</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <Card key={achievement.id} className={`p-6 ${achievement.earned ? 'bg-muted/30' : 'opacity-60'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.earned ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Icon className={`h-6 w-6 ${achievement.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        {achievement.earned && (
                          <Badge className="mt-2">Earned</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}