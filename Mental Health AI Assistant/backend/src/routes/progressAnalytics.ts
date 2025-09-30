import express from 'express';
import { param, query, validationResult } from 'express-validator';
import { ProgressAnalyticsService } from '../services/progressAnalyticsService';

const router = express.Router();
const progressAnalyticsService = ProgressAnalyticsService.getInstance();

// Validation middleware
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Get comprehensive progress analytics
router.get('/advanced/:sessionId',
  [
    param('sessionId').isUUID().withMessage('Invalid session ID'),
    query('range').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Range must be 7d, 30d, 90d, or 1y')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const range = req.query.range as string || '30d';
      
      const analytics = await progressAnalyticsService.getAdvancedAnalytics(sessionId, range);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch advanced analytics'
      });
    }
  }
);

// Get real-time correlation analysis
router.get('/correlations/:sessionId',
  [
    param('sessionId').isUUID().withMessage('Invalid session ID'),
    query('range').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Range must be 7d, 30d, 90d, or 1y')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const range = req.query.range as string || '30d';
      
      const correlations = await progressAnalyticsService.performCorrelationAnalysis(sessionId, range);
      
      res.json({
        success: true,
        data: { correlations }
      });
    } catch (error) {
      console.error('Error fetching correlation analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch correlation analysis'
      });
    }
  }
);

// Get pattern detection results
router.get('/patterns/:sessionId',
  [
    param('sessionId').isUUID().withMessage('Invalid session ID'),
    query('range').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Range must be 7d, 30d, 90d, or 1y')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const range = req.query.range as string || '30d';
      
      const patterns = await progressAnalyticsService.detectPatterns(sessionId, range);
      
      res.json({
        success: true,
        data: { patterns }
      });
    } catch (error) {
      console.error('Error fetching pattern detection:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pattern detection'
      });
    }
  }
);

// Get milestone tracking
router.get('/milestones/:sessionId',
  param('sessionId').isUUID().withMessage('Invalid session ID'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const milestones = await progressAnalyticsService.trackMilestones(sessionId);
      
      res.json({
        success: true,
        data: { milestones }
      });
    } catch (error) {
      console.error('Error fetching milestone tracking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch milestone tracking'
      });
    }
  }
);

// Get data visualization support
router.get('/visualization/:sessionId',
  [
    param('sessionId').isUUID().withMessage('Invalid session ID'),
    query('range').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Range must be 7d, 30d, 90d, or 1y')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const range = req.query.range as string || '30d';
      
      const visualizationData = await progressAnalyticsService.generateVisualizationData(sessionId, range);
      
      res.json({
        success: true,
        data: visualizationData
      });
    } catch (error) {
      console.error('Error fetching visualization data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch visualization data'
      });
    }
  }
);

// Get trend analysis
router.get('/trends/:sessionId',
  [
    param('sessionId').isUUID().withMessage('Invalid session ID'),
    query('range').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Range must be 7d, 30d, 90d, or 1y')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const range = req.query.range as string || '30d';
      
      const analytics = await progressAnalyticsService.getAdvancedAnalytics(sessionId, range);
      
      res.json({
        success: true,
        data: { 
          trends: analytics.trends,
          riskFactors: analytics.riskFactors
        }
      });
    } catch (error) {
      console.error('Error fetching trend analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trend analysis'
      });
    }
  }
);

// Get insights and recommendations
router.get('/insights/:sessionId',
  [
    param('sessionId').isUUID().withMessage('Invalid session ID'),
    query('range').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Range must be 7d, 30d, 90d, or 1y')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const range = req.query.range as string || '30d';
      
      const analytics = await progressAnalyticsService.getAdvancedAnalytics(sessionId, range);
      
      res.json({
        success: true,
        data: {
          insights: analytics.visualizationData.insights,
          recommendations: analytics.visualizationData.recommendations,
          patterns: analytics.patterns,
          riskFactors: analytics.riskFactors
        }
      });
    } catch (error) {
      console.error('Error fetching insights:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch insights'
      });
    }
  }
);

export { router as progressAnalyticsRoutes };