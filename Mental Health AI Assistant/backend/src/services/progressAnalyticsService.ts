import { Database } from '../database/database';
import { DashboardService, MoodEntry, Activity, ProgressMetrics } from './dashboardService';

export interface CorrelationAnalysis {
  title: string;
  correlation: number;
  description: string;
  insight: string;
  significance: 'high' | 'medium' | 'low';
  dataPoints: number;
}

export interface PatternDetection {
  type: 'trend' | 'cycle' | 'anomaly' | 'consistency';
  title: string;
  description: string;
  confidence: number;
  data: Record<string, any>;
  recommendations?: string[];
}

export interface MilestoneProgress {
  id: string;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  currentValue: number;
  progress: number; // 0-100
  estimatedCompletion?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface TrendAnalysis {
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  magnitude: number; // percentage change
  confidence: number; // 0-1
  timeframe: string;
  dataPoints: number;
}

export interface DataVisualizationSupport {
  chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      color: string;
      type: 'line' | 'bar' | 'area';
    }>;
  };
  insights: string[];
  recommendations: string[];
}

export interface AdvancedAnalytics {
  correlations: CorrelationAnalysis[];
  patterns: PatternDetection[];
  trends: TrendAnalysis[];
  milestones: MilestoneProgress[];
  visualizationData: DataVisualizationSupport;
  riskFactors: Array<{
    factor: string;
    level: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>;
}

export class ProgressAnalyticsService {
  private static instance: ProgressAnalyticsService;
  private db: Database;
  private dashboardService: DashboardService;

  private constructor() {
    this.db = Database.getInstance();
    this.dashboardService = DashboardService.getInstance();
  }

  public static getInstance(): ProgressAnalyticsService {
    if (!ProgressAnalyticsService.instance) {
      ProgressAnalyticsService.instance = new ProgressAnalyticsService();
    }
    return ProgressAnalyticsService.instance;
  }

  // Real-time correlation analysis with enhanced statistical methods
  async performCorrelationAnalysis(sessionId: string, timeRange: string = '30d'): Promise<CorrelationAnalysis[]> {
    const days = this.parseTimeRange(timeRange);
    const moodHistory = await this.dashboardService.getMoodHistory(sessionId, days);
    
    if (moodHistory.length < 10) {
      return []; // Need at least 10 data points for reliable correlation
    }

    const correlations: CorrelationAnalysis[] = [];

    // Enhanced correlation pairs with more sophisticated analysis
    const correlationPairs = [
      { x: 'sleep', y: 'mood', title: 'Sleep & Mood' },
      { x: 'sleep', y: 'energy', title: 'Sleep & Energy' },
      { x: 'energy', y: 'mood', title: 'Energy & Mood' },
      { x: 'stress', y: 'mood', title: 'Stress & Mood' },
      { x: 'stress', y: 'anxiety', title: 'Stress & Anxiety' },
      { x: 'anxiety', y: 'mood', title: 'Anxiety & Mood' },
      { x: 'anxiety', y: 'sleep', title: 'Anxiety & Sleep' },
      { x: 'energy', y: 'stress', title: 'Energy & Stress' }
    ];

    for (const pair of correlationPairs) {
      const xValues = moodHistory.map(e => e[pair.x as keyof MoodEntry] as number);
      const yValues = moodHistory.map(e => e[pair.y as keyof MoodEntry] as number);
      
      const correlation = this.calculatePearsonCorrelation(xValues, yValues);
      const significance = this.determineSignificance(Math.abs(correlation), moodHistory.length);
      
      if (!isNaN(correlation) && Math.abs(correlation) > 0.1) { // Only include meaningful correlations
        correlations.push({
          title: pair.title,
          correlation: Math.round(correlation * 100) / 100,
          description: this.generateCorrelationDescription(pair.title, correlation, significance),
          insight: this.generateCorrelationInsight(pair.x, pair.y, correlation),
          significance,
          dataPoints: moodHistory.length
        });
      }
    }

    // Sort by absolute correlation strength
    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  // Advanced pattern detection with machine learning-inspired techniques
  async detectPatterns(sessionId: string, timeRange: string = '30d'): Promise<PatternDetection[]> {
    const days = this.parseTimeRange(timeRange);
    const moodHistory = await this.dashboardService.getMoodHistory(sessionId, days);
    const activities = await this.dashboardService.getAllActivities(sessionId, 200);
    
    const patterns: PatternDetection[] = [];

    // Trend detection with improved algorithms
    const trendPatterns = await this.detectTrendPatterns(moodHistory);
    patterns.push(...trendPatterns);

    // Cyclical pattern detection (weekly, bi-weekly cycles)
    const cyclicalPatterns = await this.detectCyclicalPatterns(moodHistory);
    patterns.push(...cyclicalPatterns);

    // Anomaly detection
    const anomalies = await this.detectAnomalies(moodHistory);
    patterns.push(...anomalies);

    // Activity-mood relationship patterns
    const activityPatterns = await this.detectActivityPatterns(moodHistory, activities);
    patterns.push(...activityPatterns);

    // Consistency patterns
    const consistencyPatterns = await this.detectConsistencyPatterns(moodHistory);
    patterns.push(...consistencyPatterns);

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  // Milestone tracking with goal progress APIs
  async trackMilestones(sessionId: string): Promise<MilestoneProgress[]> {
    const milestones: MilestoneProgress[] = [];

    // Mood improvement milestones
    const moodMilestones = await this.trackMoodMilestones(sessionId);
    milestones.push(...moodMilestones);

    // Consistency milestones
    const consistencyMilestones = await this.trackConsistencyMilestones(sessionId);
    milestones.push(...consistencyMilestones);

    // Activity milestones
    const activityMilestones = await this.trackActivityMilestones(sessionId);
    milestones.push(...activityMilestones);

    // Risk reduction milestones
    const riskMilestones = await this.trackRiskReductionMilestones(sessionId);
    milestones.push(...riskMilestones);

    return milestones;
  }

  // Data visualization backend support
  async generateVisualizationData(sessionId: string, timeRange: string = '30d'): Promise<DataVisualizationSupport> {
    const days = this.parseTimeRange(timeRange);
    const moodHistory = await this.dashboardService.getMoodHistory(sessionId, days);
    
    // Generate chart data for multiple metrics
    const labels = moodHistory.map(entry => {
      const date = new Date(entry.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const datasets = [
      {
        label: 'Mood',
        data: moodHistory.map(e => e.mood),
        color: '#3b82f6',
        type: 'line' as const
      },
      {
        label: 'Energy',
        data: moodHistory.map(e => e.energy),
        color: '#10b981',
        type: 'line' as const
      },
      {
        label: 'Stress',
        data: moodHistory.map(e => e.stress),
        color: '#f59e0b',
        type: 'line' as const
      },
      {
        label: 'Anxiety',
        data: moodHistory.map(e => e.anxiety),
        color: '#ef4444',
        type: 'line' as const
      },
      {
        label: 'Sleep',
        data: moodHistory.map(e => e.sleep),
        color: '#8b5cf6',
        type: 'area' as const
      }
    ];

    // Generate insights based on data
    const insights = await this.generateDataInsights(moodHistory);
    const recommendations = await this.generateRecommendations(sessionId, moodHistory);

    return {
      chartData: { labels, datasets },
      insights,
      recommendations
    };
  }

  // Comprehensive analytics combining all features
  async getAdvancedAnalytics(sessionId: string, timeRange: string = '30d'): Promise<AdvancedAnalytics> {
    const [correlations, patterns, milestones, visualizationData] = await Promise.all([
      this.performCorrelationAnalysis(sessionId, timeRange),
      this.detectPatterns(sessionId, timeRange),
      this.trackMilestones(sessionId),
      this.generateVisualizationData(sessionId, timeRange)
    ]);

    const trends = await this.analyzeTrends(sessionId, timeRange);
    const riskFactors = await this.identifyRiskFactors(sessionId, timeRange);

    return {
      correlations,
      patterns,
      trends,
      milestones,
      visualizationData,
      riskFactors
    };
  }

  // Private helper methods

  private parseTimeRange(range: string): number {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }

  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return NaN;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? NaN : numerator / denominator;
  }

  private determineSignificance(correlation: number, sampleSize: number): 'high' | 'medium' | 'low' {
    // Statistical significance based on correlation strength and sample size
    if (sampleSize < 10) return 'low';
    if (correlation > 0.7 && sampleSize >= 20) return 'high';
    if (correlation > 0.5 && sampleSize >= 15) return 'medium';
    if (correlation > 0.3 && sampleSize >= 10) return 'low';
    return 'low';
  }

  private generateCorrelationDescription(title: string, correlation: number, significance: string): string {
    const strength = Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.4 ? 'Moderate' : 'Weak';
    const direction = correlation > 0 ? 'positive' : 'negative';
    return `${strength} ${direction} correlation (${significance} significance)`;
  }

  private generateCorrelationInsight(x: string, y: string, correlation: number): string {
    const insights: Record<string, Record<string, string>> = {
      'sleep': {
        'mood': correlation > 0.5 ? 'Better sleep quality consistently leads to improved mood' : 'Sleep quality shows some relationship with mood patterns',
        'energy': correlation > 0.5 ? 'Good sleep is strongly linked to higher energy levels' : 'Sleep affects your daily energy levels'
      },
      'stress': {
        'mood': correlation < -0.5 ? 'Lower stress levels are associated with better mood' : 'Stress levels impact your overall mood',
        'anxiety': correlation > 0.5 ? 'Stress and anxiety tend to occur together' : 'Stress levels relate to anxiety patterns'
      },
      'energy': {
        'mood': correlation > 0.5 ? 'Higher energy levels are linked to better mood' : 'Energy levels influence your mood',
        'stress': correlation < -0.5 ? 'Higher energy days tend to have lower stress' : 'Energy and stress levels are related'
      }
    };

    return insights[x]?.[y] || `${x} and ${y} show a relationship in your data`;
  }

  private async detectTrendPatterns(moodHistory: MoodEntry[]): Promise<PatternDetection[]> {
    if (moodHistory.length < 7) return [];

    const patterns: PatternDetection[] = [];
    const metrics = ['mood', 'energy', 'stress', 'anxiety', 'sleep'];

    for (const metric of metrics) {
      const values = moodHistory.map(e => e[metric as keyof MoodEntry] as number);
      const trend = this.calculateTrend(values);
      
      if (Math.abs(trend) > 5) { // Significant trend
        patterns.push({
          type: 'trend',
          title: `${metric.charAt(0).toUpperCase() + metric.slice(1)} Trend`,
          description: `Your ${metric} has ${trend > 0 ? 'improved' : 'declined'} by ${Math.abs(Math.round(trend))}% over the period`,
          confidence: Math.min(0.9, Math.abs(trend) / 50),
          data: {
            metric,
            change: trend,
            direction: trend > 0 ? 'improving' : 'declining'
          },
          recommendations: this.getTrendRecommendations(metric, trend)
        });
      }
    }

    return patterns;
  }

  private async detectCyclicalPatterns(moodHistory: MoodEntry[]): Promise<PatternDetection[]> {
    if (moodHistory.length < 14) return [];

    const patterns: PatternDetection[] = [];
    
    // Weekly pattern detection
    const weeklyPattern = this.detectWeeklyPattern(moodHistory);
    if (weeklyPattern.confidence > 0.6) {
      patterns.push(weeklyPattern);
    }

    return patterns;
  }

  private async detectAnomalies(moodHistory: MoodEntry[]): Promise<PatternDetection[]> {
    if (moodHistory.length < 10) return [];

    const patterns: PatternDetection[] = [];
    const metrics = ['mood', 'energy', 'stress', 'anxiety', 'sleep'];

    for (const metric of metrics) {
      const values = moodHistory.map(e => e[metric as keyof MoodEntry] as number);
      const anomalies = this.detectOutliers(values);
      
      if (anomalies.length > 0) {
        patterns.push({
          type: 'anomaly',
          title: `${metric.charAt(0).toUpperCase() + metric.slice(1)} Anomalies`,
          description: `Detected ${anomalies.length} unusual ${metric} readings`,
          confidence: 0.8,
          data: {
            metric,
            anomalies,
            count: anomalies.length
          }
        });
      }
    }

    return patterns;
  }

  private async detectActivityPatterns(moodHistory: MoodEntry[], activities: Activity[]): Promise<PatternDetection[]> {
    const patterns: PatternDetection[] = [];
    
    // Analyze mood on days with different activity types
    const activityMoodMap = new Map<string, number[]>();
    
    activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp).toISOString().split('T')[0];
      const moodEntry = moodHistory.find(m => m.date === activityDate);
      
      if (moodEntry) {
        if (!activityMoodMap.has(activity.type)) {
          activityMoodMap.set(activity.type, []);
        }
        activityMoodMap.get(activity.type)!.push(moodEntry.mood);
      }
    });

    // Find activity types that correlate with better mood
    activityMoodMap.forEach((moods, activityType) => {
      if (moods.length >= 3) {
        const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
        const overallAvg = moodHistory.reduce((sum, e) => sum + e.mood, 0) / moodHistory.length;
        
        if (avgMood > overallAvg + 0.5) {
          patterns.push({
            type: 'consistency',
            title: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} Activity Boost`,
            description: `Your mood tends to be ${Math.round((avgMood - overallAvg) * 10) / 10} points higher on days with ${activityType} activities`,
            confidence: 0.7,
            data: {
              activityType,
              moodBoost: avgMood - overallAvg,
              occurrences: moods.length
            },
            recommendations: [`Consider incorporating more ${activityType} activities into your routine`]
          });
        }
      }
    });

    return patterns;
  }

  private async detectConsistencyPatterns(moodHistory: MoodEntry[]): Promise<PatternDetection[]> {
    if (moodHistory.length < 7) return [];

    const patterns: PatternDetection[] = [];
    const metrics = ['mood', 'energy', 'stress', 'anxiety', 'sleep'];

    for (const metric of metrics) {
      const values = moodHistory.map(e => e[metric as keyof MoodEntry] as number);
      const variance = this.calculateVariance(values);
      const isConsistent = variance < 2;

      if (isConsistent) {
        patterns.push({
          type: 'consistency',
          title: `Stable ${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
          description: `Your ${metric} has been consistently stable (variance: ${Math.round(variance * 100) / 100})`,
          confidence: 0.8,
          data: {
            metric,
            variance,
            stability: 'high'
          }
        });
      }
    }

    return patterns;
  }

  private async trackMoodMilestones(sessionId: string): Promise<MilestoneProgress[]> {
    const moodHistory = await this.dashboardService.getMoodHistory(sessionId, 90);
    const milestones: MilestoneProgress[] = [];

    // Average mood improvement milestone
    if (moodHistory.length >= 7) {
      const recentAvg = moodHistory.slice(-7).reduce((sum, e) => sum + e.mood, 0) / 7;
      milestones.push({
        id: 'mood-improvement-8',
        title: 'Achieve Average Mood of 8+',
        description: 'Maintain an average mood score of 8 or higher for a week',
        category: 'mood',
        targetValue: 8,
        currentValue: Math.round(recentAvg * 10) / 10,
        progress: Math.min(100, (recentAvg / 8) * 100),
        isCompleted: recentAvg >= 8,
        completedAt: recentAvg >= 8 ? new Date().toISOString() : undefined
      });
    }

    // Mood consistency milestone
    if (moodHistory.length >= 14) {
      const values = moodHistory.slice(-14).map(e => e.mood);
      const variance = this.calculateVariance(values);
      milestones.push({
        id: 'mood-consistency',
        title: 'Maintain Mood Stability',
        description: 'Keep mood variance below 1.5 for two weeks',
        category: 'consistency',
        targetValue: 1.5,
        currentValue: Math.round(variance * 100) / 100,
        progress: Math.min(100, Math.max(0, (1.5 - variance) / 1.5 * 100)),
        isCompleted: variance <= 1.5,
        completedAt: variance <= 1.5 ? new Date().toISOString() : undefined
      });
    }

    return milestones;
  }

  private async trackConsistencyMilestones(sessionId: string): Promise<MilestoneProgress[]> {
    const moodHistory = await this.dashboardService.getMoodHistory(sessionId, 30);
    const milestones: MilestoneProgress[] = [];

    // Check-in streak milestone
    const streakDays = await this.calculateMoodStreak(sessionId);
    milestones.push({
      id: 'checkin-streak-30',
      title: '30-Day Check-in Streak',
      description: 'Complete daily mood check-ins for 30 consecutive days',
      category: 'consistency',
      targetValue: 30,
      currentValue: streakDays,
      progress: Math.min(100, (streakDays / 30) * 100),
      isCompleted: streakDays >= 30,
      completedAt: streakDays >= 30 ? new Date().toISOString() : undefined,
      estimatedCompletion: streakDays > 0 ? this.estimateCompletion(streakDays, 30) : undefined
    });

    return milestones;
  }

  private async trackActivityMilestones(sessionId: string): Promise<MilestoneProgress[]> {
    const activities = await this.dashboardService.getAllActivities(sessionId, 100);
    const milestones: MilestoneProgress[] = [];

    // Chat sessions milestone
    const chatCount = activities.filter(a => a.type === 'chat').length;
    milestones.push({
      id: 'chat-sessions-20',
      title: '20 AI Conversations',
      description: 'Complete 20 conversations with the AI assistant',
      category: 'engagement',
      targetValue: 20,
      currentValue: chatCount,
      progress: Math.min(100, (chatCount / 20) * 100),
      isCompleted: chatCount >= 20,
      completedAt: chatCount >= 20 ? new Date().toISOString() : undefined
    });

    return milestones;
  }

  private async trackRiskReductionMilestones(sessionId: string): Promise<MilestoneProgress[]> {
    const milestones: MilestoneProgress[] = [];

    // Get recent risk assessments
    const recentAssessments = await this.db.all<any>(
      `SELECT overall_risk, created_at FROM risk_assessments 
       WHERE session_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [sessionId]
    );

    if (recentAssessments.length >= 2) {
      const latestRisk = recentAssessments[0].overall_risk;
      const previousRisk = recentAssessments[recentAssessments.length - 1].overall_risk;
      const riskReduction = previousRisk - latestRisk;

      milestones.push({
        id: 'risk-reduction-20',
        title: 'Reduce Risk Score by 20%',
        description: 'Lower your overall risk assessment by 20 percentage points',
        category: 'wellness',
        targetValue: 20,
        currentValue: Math.max(0, riskReduction),
        progress: Math.min(100, (riskReduction / 20) * 100),
        isCompleted: riskReduction >= 20,
        completedAt: riskReduction >= 20 ? new Date().toISOString() : undefined
      });
    }

    return milestones;
  }

  private async generateDataInsights(moodHistory: MoodEntry[]): Promise<string[]> {
    const insights: string[] = [];

    if (moodHistory.length === 0) return insights;

    // Overall trend insight
    const moodValues = moodHistory.map(e => e.mood);
    const trend = this.calculateTrend(moodValues);
    if (Math.abs(trend) > 5) {
      insights.push(`Your mood has ${trend > 0 ? 'improved' : 'declined'} by ${Math.abs(Math.round(trend))}% over this period`);
    }

    // Best and worst days
    const maxMood = Math.max(...moodValues);
    const minMood = Math.min(...moodValues);
    const bestDay = moodHistory.find(e => e.mood === maxMood);
    const worstDay = moodHistory.find(e => e.mood === minMood);

    if (bestDay && worstDay) {
      insights.push(`Your best mood day was ${new Date(bestDay.date).toLocaleDateString()} (${maxMood}/10)`);
      insights.push(`Your most challenging day was ${new Date(worstDay.date).toLocaleDateString()} (${minMood}/10)`);
    }

    // Consistency insight
    const variance = this.calculateVariance(moodValues);
    if (variance < 1.5) {
      insights.push('Your mood has been remarkably consistent, showing good emotional stability');
    } else if (variance > 3) {
      insights.push('Your mood shows significant variation - consider identifying triggers for low mood days');
    }

    return insights;
  }

  private async generateRecommendations(sessionId: string, moodHistory: MoodEntry[]): Promise<string[]> {
    const recommendations: string[] = [];

    if (moodHistory.length === 0) return recommendations;

    // Analyze patterns for recommendations
    const correlations = await this.performCorrelationAnalysis(sessionId, '30d');
    
    // Sleep-based recommendations
    const sleepMoodCorr = correlations.find(c => c.title === 'Sleep & Mood');
    if (sleepMoodCorr && sleepMoodCorr.correlation > 0.5) {
      const avgSleep = moodHistory.reduce((sum, e) => sum + e.sleep, 0) / moodHistory.length;
      if (avgSleep < 7) {
        recommendations.push('Focus on improving sleep quality - it strongly correlates with your mood improvements');
      }
    }

    // Stress management recommendations
    const avgStress = moodHistory.reduce((sum, e) => sum + e.stress, 0) / moodHistory.length;
    if (avgStress > 6) {
      recommendations.push('Consider stress management techniques like meditation or deep breathing exercises');
    }

    // Activity recommendations
    const activities = await this.dashboardService.getAllActivities(sessionId, 50);
    const chatCount = activities.filter(a => a.type === 'chat').length;
    if (chatCount < 5) {
      recommendations.push('Regular conversations with the AI assistant may help with emotional processing');
    }

    return recommendations;
  }

  private async analyzeTrends(sessionId: string, timeRange: string): Promise<TrendAnalysis[]> {
    const days = this.parseTimeRange(timeRange);
    const moodHistory = await this.dashboardService.getMoodHistory(sessionId, days);
    
    const trends: TrendAnalysis[] = [];
    const metrics = ['mood', 'energy', 'stress', 'anxiety', 'sleep'];

    for (const metric of metrics) {
      const values = moodHistory.map(e => e[metric as keyof MoodEntry] as number);
      const trend = this.calculateTrend(values);
      
      if (Math.abs(trend) > 2) { // Only significant trends
        trends.push({
          metric,
          direction: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
          magnitude: Math.abs(trend),
          confidence: Math.min(0.95, values.length / 30), // Higher confidence with more data
          timeframe: timeRange,
          dataPoints: values.length
        });
      }
    }

    return trends;
  }

  private async identifyRiskFactors(sessionId: string, timeRange: string): Promise<Array<{
    factor: string;
    level: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>> {
    const days = this.parseTimeRange(timeRange);
    const moodHistory = await this.dashboardService.getMoodHistory(sessionId, days);
    const riskFactors = [];

    if (moodHistory.length === 0) return riskFactors;

    // Low mood trend risk
    const moodTrend = this.calculateTrend(moodHistory.map(e => e.mood));
    if (moodTrend < -10) {
      riskFactors.push({
        factor: 'Declining Mood Trend',
        level: 'high' as const,
        description: `Mood has declined by ${Math.abs(Math.round(moodTrend))}% over the period`,
        recommendation: 'Consider reaching out to a mental health professional for support'
      });
    }

    // High stress levels
    const avgStress = moodHistory.reduce((sum, e) => sum + e.stress, 0) / moodHistory.length;
    if (avgStress > 7) {
      riskFactors.push({
        factor: 'Elevated Stress Levels',
        level: 'medium' as const,
        description: `Average stress level is ${Math.round(avgStress * 10) / 10}/10`,
        recommendation: 'Implement stress reduction techniques and consider professional guidance'
      });
    }

    // Poor sleep quality
    const avgSleep = moodHistory.reduce((sum, e) => sum + e.sleep, 0) / moodHistory.length;
    if (avgSleep < 5) {
      riskFactors.push({
        factor: 'Poor Sleep Quality',
        level: 'medium' as const,
        description: `Average sleep quality is ${Math.round(avgSleep * 10) / 10}/10`,
        recommendation: 'Focus on sleep hygiene and consider consulting a healthcare provider'
      });
    }

    return riskFactors;
  }

  // Utility methods
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const halfPoint = Math.floor(n / 2);
    
    const firstHalf = values.slice(0, halfPoint);
    const secondHalf = values.slice(-halfPoint);
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return ((secondAvg - firstAvg) / firstAvg) * 100;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private detectWeeklyPattern(moodHistory: MoodEntry[]): PatternDetection {
    const dayAverages: Record<string, number[]> = {
      'Sunday': [], 'Monday': [], 'Tuesday': [], 'Wednesday': [], 
      'Thursday': [], 'Friday': [], 'Saturday': []
    };

    moodHistory.forEach(entry => {
      const date = new Date(entry.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      dayAverages[dayName].push(entry.mood);
    });

    const dayStats = Object.entries(dayAverages)
      .filter(([_, moods]) => moods.length > 0)
      .map(([day, moods]) => ({
        day,
        average: moods.reduce((a, b) => a + b, 0) / moods.length,
        count: moods.length
      }));

    if (dayStats.length < 3) {
      return {
        type: 'cycle',
        title: 'Weekly Pattern',
        description: 'Insufficient data for weekly pattern analysis',
        confidence: 0,
        data: {}
      };
    }

    const variance = this.calculateVariance(dayStats.map(d => d.average));
    const confidence = Math.min(0.9, variance / 2); // Higher variance = more pattern

    const bestDay = dayStats.reduce((a, b) => a.average > b.average ? a : b);
    const worstDay = dayStats.reduce((a, b) => a.average < b.average ? a : b);

    return {
      type: 'cycle',
      title: 'Weekly Mood Pattern',
      description: `Your mood tends to be highest on ${bestDay.day} and lowest on ${worstDay.day}`,
      confidence,
      data: {
        bestDay: bestDay.day,
        worstDay: worstDay.day,
        dayStats,
        variance
      }
    };
  }

  private detectOutliers(values: number[]): number[] {
    if (values.length < 5) return [];

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(this.calculateVariance(values));
    
    return values.filter(value => Math.abs(value - mean) > 2 * stdDev);
  }

  private getTrendRecommendations(metric: string, trend: number): string[] {
    const recommendations: string[] = [];
    
    if (trend > 0) {
      // Positive trend recommendations
      switch (metric) {
        case 'mood':
          recommendations.push('Keep up the great work! Continue the activities that are boosting your mood');
          break;
        case 'energy':
          recommendations.push('Your energy levels are improving - maintain your current routine');
          break;
        case 'sleep':
          recommendations.push('Your sleep quality is getting better - stick to your current sleep habits');
          break;
      }
    } else {
      // Negative trend recommendations
      switch (metric) {
        case 'mood':
          recommendations.push('Consider identifying triggers for low mood and developing coping strategies');
          break;
        case 'stress':
          recommendations.push('Great job reducing stress! Continue with stress management techniques');
          break;
        case 'anxiety':
          recommendations.push('Your anxiety levels are improving - keep practicing anxiety management techniques');
          break;
      }
    }

    return recommendations;
  }

  private async calculateMoodStreak(sessionId: string): Promise<number> {
    const entries = await this.db.all<any>(
      `SELECT date FROM mood_entries 
       WHERE session_id = ? 
       ORDER BY date DESC`,
      [sessionId]
    );

    if (entries.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < entries.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const checkDateStr = checkDate.toISOString().split('T')[0];
      
      const hasEntry = entries.some(entry => entry.date === checkDateStr);
      if (hasEntry) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private estimateCompletion(current: number, target: number): string {
    if (current >= target) return new Date().toISOString();
    
    const remaining = target - current;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + remaining);
    
    return estimatedDate.toISOString();
  }
}