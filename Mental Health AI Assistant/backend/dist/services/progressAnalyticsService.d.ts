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
    progress: number;
    estimatedCompletion?: string;
    isCompleted: boolean;
    completedAt?: string;
}
export interface TrendAnalysis {
    metric: string;
    direction: 'improving' | 'declining' | 'stable';
    magnitude: number;
    confidence: number;
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
export declare class ProgressAnalyticsService {
    private static instance;
    private db;
    private dashboardService;
    private constructor();
    static getInstance(): ProgressAnalyticsService;
    performCorrelationAnalysis(sessionId: string, timeRange?: string): Promise<CorrelationAnalysis[]>;
    detectPatterns(sessionId: string, timeRange?: string): Promise<PatternDetection[]>;
    trackMilestones(sessionId: string): Promise<MilestoneProgress[]>;
    generateVisualizationData(sessionId: string, timeRange?: string): Promise<DataVisualizationSupport>;
    getAdvancedAnalytics(sessionId: string, timeRange?: string): Promise<AdvancedAnalytics>;
    private parseTimeRange;
    private calculatePearsonCorrelation;
    private determineSignificance;
    private generateCorrelationDescription;
    private generateCorrelationInsight;
    private detectTrendPatterns;
    private detectCyclicalPatterns;
    private detectAnomalies;
    private detectActivityPatterns;
    private detectConsistencyPatterns;
    private trackMoodMilestones;
    private trackConsistencyMilestones;
    private trackActivityMilestones;
    private trackRiskReductionMilestones;
    private generateDataInsights;
    private generateRecommendations;
    private analyzeTrends;
    private identifyRiskFactors;
    private calculateTrend;
    private calculateVariance;
    private detectWeeklyPattern;
    private detectOutliers;
    private getTrendRecommendations;
    private calculateMoodStreak;
    private estimateCompletion;
}
//# sourceMappingURL=progressAnalyticsService.d.ts.map