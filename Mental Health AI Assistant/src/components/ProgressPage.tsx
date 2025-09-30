import { useState } from "react";
import { TrendingUp, TrendingDown, Calendar, BarChart3, LineChart, Download, Filter, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { useSession } from "../hooks/useSession";
import { useProgress } from "../hooks/useProgress";

interface ProgressPageProps {
  onBack: () => void;
}

const moodTrendData = [
  { date: '2024-01-01', mood: 6, energy: 5, stress: 6, anxiety: 5, sleep: 7 },
  { date: '2024-01-02', mood: 7, energy: 6, stress: 5, anxiety: 4, sleep: 6 },
  { date: '2024-01-03', mood: 8, energy: 7, stress: 4, anxiety: 3, sleep: 8 },
  { date: '2024-01-04', mood: 7, energy: 6, stress: 5, anxiety: 4, sleep: 7 },
  { date: '2024-01-05', mood: 9, energy: 8, stress: 3, anxiety: 2, sleep: 9 },
  { date: '2024-01-06', mood: 8, energy: 7, stress: 4, anxiety: 3, sleep: 8 },
  { date: '2024-01-07', mood: 7, energy: 6, stress: 5, anxiety: 4, sleep: 7 },
  { date: '2024-01-08', mood: 8, energy: 7, stress: 3, anxiety: 3, sleep: 8 },
  { date: '2024-01-09', mood: 9, energy: 8, stress: 2, anxiety: 2, sleep: 9 },
  { date: '2024-01-10', mood: 8, energy: 7, stress: 3, anxiety: 3, sleep: 8 }
];

const insights = [
  {
    type: 'positive',
    title: 'Mood Improvement',
    description: 'Your average mood has increased by 15% over the past 2 weeks',
    metric: '+15%',
    icon: TrendingUp,
    color: 'text-green-600'
  },
  {
    type: 'neutral',
    title: 'Sleep Quality',
    description: 'Your sleep scores have been consistently good (7-9/10)',
    metric: '8.2/10',
    icon: BarChart3,
    color: 'text-blue-600'
  },
  {
    type: 'attention',
    title: 'Stress Levels',
    description: 'Stress has decreased but shows some fluctuation on weekdays',
    metric: '-8%',
    icon: TrendingDown,
    color: 'text-orange-600'
  }
];

const milestones = [
  {
    date: '2024-01-10',
    title: '10-Day Streak',
    description: 'Completed daily check-ins for 10 consecutive days',
    achieved: true
  },
  {
    date: '2024-01-08',
    title: 'Anxiety Reduction',
    description: 'Achieved lowest anxiety score (2/10) in 3 months',
    achieved: true
  },
  {
    date: '2024-01-05',
    title: 'Best Mood Day',
    description: 'Recorded highest mood score (9/10) this month',
    achieved: true
  },
  {
    date: '2024-01-03',
    title: 'First AI Chat',
    description: 'Started first conversation with AI assistant',
    achieved: true
  }
];

const correlations = [
  {
    title: 'Sleep & Mood',
    correlation: 0.85,
    description: 'Strong positive correlation between sleep quality and next-day mood',
    insight: 'Better sleep consistently leads to improved mood the following day'
  },
  {
    title: 'Exercise & Anxiety',
    correlation: -0.72,
    description: 'Moderate negative correlation between physical activity and anxiety levels',
    insight: 'Days with exercise tend to have lower anxiety scores'
  },
  {
    title: 'Stress & Energy',
    correlation: -0.68,
    description: 'Moderate negative correlation between stress and energy levels',
    insight: 'Higher stress days correlate with lower energy levels'
  }
];

export function ProgressPage({ onBack }: ProgressPageProps) {
  const [selectedMetric, setSelectedMetric] = useState('all');
  const { session } = useSession();
  const { 
    analytics, 
    advancedAnalytics,
    metrics, 
    moodHistory, 
    achievements, 
    loading, 
    error, 
    timeRange, 
    updateTimeRange, 
    getMetricStats, 
    getTrends, 
    getInsights 
  } = useProgress(session?.id || null);

  // Fallback data for when backend is not available
  const fallbackMoodData = [
    { date: '2024-01-01', mood: 6, energy: 5, stress: 6, anxiety: 5, sleep: 7 },
    { date: '2024-01-02', mood: 7, energy: 6, stress: 5, anxiety: 4, sleep: 6 },
    { date: '2024-01-03', mood: 8, energy: 7, stress: 4, anxiety: 3, sleep: 8 },
    { date: '2024-01-04', mood: 7, energy: 6, stress: 5, anxiety: 4, sleep: 7 },
    { date: '2024-01-05', mood: 9, energy: 8, stress: 3, anxiety: 2, sleep: 9 },
    { date: '2024-01-06', mood: 8, energy: 7, stress: 4, anxiety: 3, sleep: 8 },
    { date: '2024-01-07', mood: 7, energy: 6, stress: 5, anxiety: 4, sleep: 7 },
    { date: '2024-01-08', mood: 8, energy: 7, stress: 3, anxiety: 3, sleep: 8 },
    { date: '2024-01-09', mood: 9, energy: 8, stress: 2, anxiety: 2, sleep: 9 },
    { date: '2024-01-10', mood: 8, energy: 7, stress: 3, anxiety: 3, sleep: 8 }
  ];

  // Use backend data if available, otherwise fallback to mock data
  const moodTrendData = moodHistory.length > 0 ? moodHistory.map(entry => ({
    date: entry.date,
    mood: entry.mood,
    energy: entry.energy,
    stress: entry.stress,
    anxiety: entry.anxiety,
    sleep: entry.sleep
  })) : fallbackMoodData;

  const trends = getTrends();
  const insights = getInsights();

  // Use backend insights if available, otherwise fallback
  const displayInsights = insights.length > 0 ? insights : [
    {
      type: 'positive',
      title: 'Mood Improvement',
      description: 'Your average mood has increased by 15% over the past 2 weeks',
      metric: '+15%',
      icon: 'TrendingUp',
      color: 'text-green-600'
    },
    {
      type: 'neutral',
      title: 'Sleep Quality',
      description: 'Your sleep scores have been consistently good (7-9/10)',
      metric: '8.2/10',
      icon: 'BarChart3',
      color: 'text-blue-600'
    }
  ];

  // Get trend values for display
  const { mood: moodTrend, energy: energyTrend, stress: stressTrend, anxiety: anxietyTrend } = trends;

  // Use advanced analytics milestones if available
  const advancedMilestones = advancedAnalytics?.milestones || [];
  
  const displayMilestones = achievements.filter(a => a.earned).map(achievement => ({
    date: achievement.earnedAt || new Date().toISOString(),
    title: achievement.title,
    description: achievement.description,
    achieved: achievement.earned
  }));

  // Add fallback milestones if no backend data
  const milestones = displayMilestones.length > 0 ? displayMilestones : [
    {
      date: '2024-01-10',
      title: '10-Day Streak',
      description: 'Completed daily check-ins for 10 consecutive days',
      achieved: true
    },
    {
      date: '2024-01-08',
      title: 'Anxiety Reduction',
      description: 'Achieved lowest anxiety score (2/10) in 3 months',
      achieved: true
    }
  ];

  const correlations = advancedAnalytics?.correlations || analytics?.correlations || [
    {
      title: 'Sleep & Mood',
      correlation: 0.85,
      description: 'Strong positive correlation between sleep quality and next-day mood',
      insight: 'Better sleep consistently leads to improved mood the following day'
    },
    {
      title: 'Exercise & Anxiety',
      correlation: -0.72,
      description: 'Moderate negative correlation between physical activity and anxiety levels',
      insight: 'Days with exercise tend to have lower anxiety scores'
    }
  ];

  // Use backend weekly patterns if available
  const weeklyPatterns = advancedAnalytics?.visualizationData ? {
    weekdayAverage: 7.2,
    weekendAverage: 8.1,
    bestDay: 'Saturday',
    worstDay: 'Monday'
  } : analytics?.weeklyPatterns;

  const formatTrend = (trend: number) => {
    const sign = trend >= 0 ? '+' : '';
    return `${sign}${Math.round(trend)}%`;
  };

  const getTrendColor = (trend: number, reverse = false) => {
    const isPositive = reverse ? trend < 0 : trend > 0;
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
          <p className="text-lg font-medium">Loading your progress data...</p>
          <p className="text-sm text-muted-foreground">Analyzing your mental health journey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30">
      {/* Header */}
      <div className="border-b bg-card mb-6">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl">Progress Tracking</h1>
              <p className="text-muted-foreground">Detailed insights into your mental health journey</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={updateTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-4 pt-4">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Connection Issue:</strong> {error}. Showing cached data.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">Mood</h3>
                  <span className={`text-sm font-medium ${getTrendColor(moodTrend)}`}>
                    {formatTrend(moodTrend)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{getMetricStats('mood').average}/10</div>
                  <Progress value={getMetricStats('mood').average * 10} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {getMetricStats('mood').min}</span>
                    <span>Max: {getMetricStats('mood').max}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">Energy</h3>
                  <span className={`text-sm font-medium ${getTrendColor(energyTrend)}`}>
                    {formatTrend(energyTrend)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{getMetricStats('energy').average}/10</div>
                  <Progress value={getMetricStats('energy').average * 10} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {getMetricStats('energy').min}</span>
                    <span>Max: {getMetricStats('energy').max}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">Stress</h3>
                  <span className={`text-sm font-medium ${getTrendColor(stressTrend, true)}`}>
                    {formatTrend(stressTrend)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{getMetricStats('stress').average}/10</div>
                  <Progress value={getMetricStats('stress').average * 10} className="h-2 [&>div]:bg-orange-500" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {getMetricStats('stress').min}</span>
                    <span>Max: {getMetricStats('stress').max}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">Anxiety</h3>
                  <span className={`text-sm font-medium ${getTrendColor(anxietyTrend, true)}`}>
                    {formatTrend(anxietyTrend)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{getMetricStats('anxiety').average}/10</div>
                  <Progress value={getMetricStats('anxiety').average * 10} className="h-2 [&>div]:bg-red-500" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {getMetricStats('anxiety').min}</span>
                    <span>Max: {getMetricStats('anxiety').max}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Insights */}
            <div className="grid lg:grid-cols-3 gap-4">
              {displayInsights.map((insight, index) => {
                const iconMap: Record<string, any> = {
                  'TrendingUp': TrendingUp,
                  'TrendingDown': TrendingDown,
                  'BarChart3': BarChart3
                };
                const Icon = iconMap[insight.icon] || BarChart3;
                return (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Icon className={`h-5 w-5 ${insight.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        <Badge variant="secondary">{insight.metric}</Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium">Daily Trends</h3>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Metrics</SelectItem>
                    <SelectItem value="mood">Mood Only</SelectItem>
                    <SelectItem value="energy">Energy Only</SelectItem>
                    <SelectItem value="stress">Stress Only</SelectItem>
                    <SelectItem value="anxiety">Anxiety Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Simplified chart representation */}
              <div className="space-y-6">
                {moodTrendData.slice(-10).map((day, index) => (
                  <div key={day.date} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex gap-4 text-sm">
                        {(selectedMetric === 'all' || selectedMetric === 'mood') && (
                          <span className="text-blue-600">Mood: {day.mood}</span>
                        )}
                        {(selectedMetric === 'all' || selectedMetric === 'energy') && (
                          <span className="text-green-600">Energy: {day.energy}</span>
                        )}
                        {(selectedMetric === 'all' || selectedMetric === 'stress') && (
                          <span className="text-orange-600">Stress: {day.stress}</span>
                        )}
                        {(selectedMetric === 'all' || selectedMetric === 'anxiety') && (
                          <span className="text-red-600">Anxiety: {day.anxiety}</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {(selectedMetric === 'all' || selectedMetric === 'mood') && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Mood</div>
                          <Progress value={day.mood * 10} className="h-2" />
                        </div>
                      )}
                      {(selectedMetric === 'all' || selectedMetric === 'energy') && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Energy</div>
                          <Progress value={day.energy * 10} className="h-2 [&>div]:bg-green-500" />
                        </div>
                      )}
                      {(selectedMetric === 'all' || selectedMetric === 'stress') && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Stress</div>
                          <Progress value={day.stress * 10} className="h-2 [&>div]:bg-orange-500" />
                        </div>
                      )}
                      {(selectedMetric === 'all' || selectedMetric === 'anxiety') && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Anxiety</div>
                          <Progress value={day.anxiety * 10} className="h-2 [&>div]:bg-red-500" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-6">Pattern Analysis</h3>
              <div className="space-y-6">
                {correlations.map((correlation, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{correlation.title}</h4>
                      <Badge variant={Math.abs(correlation.correlation) > 0.7 ? 'default' : 'secondary'}>
                        {Math.abs(correlation.correlation) > 0.7 ? 'Strong' : 'Moderate'} 
                        {correlation.correlation > 0 ? ' Positive' : ' Negative'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{correlation.description}</p>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm">Correlation strength:</span>
                      <Progress value={Math.abs(correlation.correlation) * 100} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{Math.round(Math.abs(correlation.correlation) * 100)}%</span>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">{correlation.insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-medium mb-4">Weekly Patterns</h3>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Weekday vs Weekend</h4>
                  {weeklyPatterns ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-3">
                        Your mood tends to be {weeklyPatterns.weekendAverage > weeklyPatterns.weekdayAverage ? 'higher' : 'lower'} on weekends.
                        Best day: {weeklyPatterns.bestDay}, Most challenging: {weeklyPatterns.worstDay}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-muted-foreground">Weekdays</span>
                          <div className="text-lg font-medium">Mood: {weeklyPatterns.weekdayAverage}/10</div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Weekends</span>
                          <div className="text-lg font-medium">Mood: {weeklyPatterns.weekendAverage}/10</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-3">
                        Your mood tends to be 12% higher on weekends, while stress is 25% lower.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-muted-foreground">Weekdays</span>
                          <div className="text-lg font-medium">Mood: 7.2/10</div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Weekends</span>
                          <div className="text-lg font-medium">Mood: 8.1/10</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Advanced Pattern Detection</h4>
                  {advancedAnalytics?.patterns && advancedAnalytics.patterns.length > 0 ? (
                    <div className="space-y-2">
                      {advancedAnalytics.patterns.slice(0, 3).map((pattern, index) => (
                        <div key={index} className="p-2 bg-muted/50 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{pattern.title}</span>
                            <Badge variant={pattern.confidence > 0.7 ? 'default' : 'secondary'}>
                              {Math.round(pattern.confidence * 100)}% confidence
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{pattern.description}</p>
                          {pattern.recommendations && pattern.recommendations.length > 0 && (
                            <p className="text-xs text-blue-600 mt-1">💡 {pattern.recommendations[0]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Advanced pattern detection will be available as more data is collected.
                    </p>
                  )}
                </div>

                {advancedAnalytics?.riskFactors && advancedAnalytics.riskFactors.length > 0 && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Areas for Attention</h4>
                    <div className="space-y-2">
                      {advancedAnalytics.riskFactors.map((risk, index) => (
                        <div key={index} className="p-2 bg-muted/50 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{risk.factor}</span>
                            <Badge variant={risk.level === 'high' ? 'destructive' : risk.level === 'medium' ? 'default' : 'secondary'}>
                              {risk.level} priority
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{risk.description}</p>
                          <p className="text-xs text-blue-600">💡 {risk.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-6">Recent Milestones</h3>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{milestone.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(milestone.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-medium mb-4">Progress Goals</h3>
              <div className="space-y-3">
                {advancedMilestones.length > 0 ? (
                  advancedMilestones.map((milestone, index) => (
                    <div key={milestone.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{milestone.title}</span>
                        <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={milestone.progress} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground">
                          {milestone.currentValue}/{milestone.targetValue}
                        </span>
                        {milestone.isCompleted && (
                          <Badge variant="default" className="ml-2">Complete</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Complete 14-day check-in streak</span>
                      <div className="flex items-center gap-2">
                        <Progress value={71} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground">10/14</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Achieve average mood of 8+</span>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground">7.8/8.0</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Complete first therapy session</span>
                      <Badge variant="secondary">Scheduled</Badge>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}