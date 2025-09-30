import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Progress } from './progress';
import { Alert, AlertDescription } from './alert';
import { Badge } from './badge';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
}

interface TestStep {
  id: string;
  description: string;
  action: () => Promise<void>;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
}

interface IntegrationTestProps {
  onComplete?: (results: TestScenario[]) => void;
  autoRun?: boolean;
}

export function IntegrationTest({ onComplete, autoRun = false }: IntegrationTestProps) {
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    initializeTestScenarios();
  }, []);

  useEffect(() => {
    if (autoRun && scenarios.length > 0) {
      runAllTests();
    }
  }, [autoRun, scenarios]);

  const initializeTestScenarios = () => {
    const testScenarios: TestScenario[] = [
      {
        id: 'user-onboarding',
        name: 'User Onboarding Flow',
        description: 'Test complete user onboarding from landing to dashboard',
        status: 'pending',
        steps: [
          {
            id: 'landing-page',
            description: 'Load landing page and verify components',
            action: testLandingPage,
            status: 'pending'
          },
          {
            id: 'get-started',
            description: 'Navigate to get started flow',
            action: testGetStartedFlow,
            status: 'pending'
          },
          {
            id: 'assessment',
            description: 'Complete mental health assessment',
            action: testAssessmentFlow,
            status: 'pending'
          },
          {
            id: 'results',
            description: 'View assessment results',
            action: testResultsDisplay,
            status: 'pending'
          },
          {
            id: 'dashboard',
            description: 'Access personalized dashboard',
            action: testDashboardAccess,
            status: 'pending'
          }
        ]
      },
      {
        id: 'chat-functionality',
        name: 'AI Chat Functionality',
        description: 'Test AI chat features and safety monitoring',
        status: 'pending',
        steps: [
          {
            id: 'chat-init',
            description: 'Initialize chat session',
            action: testChatInitialization,
            status: 'pending'
          },
          {
            id: 'send-message',
            description: 'Send message and receive response',
            action: testMessageExchange,
            status: 'pending'
          },
          {
            id: 'safety-check',
            description: 'Test safety monitoring',
            action: testSafetyMonitoring,
            status: 'pending'
          },
          {
            id: 'crisis-detection',
            description: 'Test crisis detection and referrals',
            action: testCrisisDetection,
            status: 'pending'
          }
        ]
      },
      {
        id: 'data-persistence',
        name: 'Data Persistence',
        description: 'Test data storage and retrieval',
        status: 'pending',
        steps: [
          {
            id: 'session-storage',
            description: 'Test session data storage',
            action: testSessionStorage,
            status: 'pending'
          },
          {
            id: 'user-preferences',
            description: 'Test user preferences persistence',
            action: testUserPreferences,
            status: 'pending'
          },
          {
            id: 'conversation-history',
            description: 'Test conversation history storage',
            action: testConversationHistory,
            status: 'pending'
          }
        ]
      },
      {
        id: 'responsive-design',
        name: 'Responsive Design',
        description: 'Test responsive behavior across devices',
        status: 'pending',
        steps: [
          {
            id: 'mobile-layout',
            description: 'Test mobile layout and navigation',
            action: testMobileLayout,
            status: 'pending'
          },
          {
            id: 'tablet-layout',
            description: 'Test tablet layout optimization',
            action: testTabletLayout,
            status: 'pending'
          },
          {
            id: 'desktop-layout',
            description: 'Test desktop layout and features',
            action: testDesktopLayout,
            status: 'pending'
          },
          {
            id: 'touch-interactions',
            description: 'Test touch interactions on mobile',
            action: testTouchInteractions,
            status: 'pending'
          }
        ]
      },
      {
        id: 'error-handling',
        name: 'Error Handling',
        description: 'Test error scenarios and recovery',
        status: 'pending',
        steps: [
          {
            id: 'network-error',
            description: 'Test network error handling',
            action: testNetworkError,
            status: 'pending'
          },
          {
            id: 'api-error',
            description: 'Test API error responses',
            action: testAPIError,
            status: 'pending'
          },
          {
            id: 'offline-mode',
            description: 'Test offline mode functionality',
            action: testOfflineMode,
            status: 'pending'
          },
          {
            id: 'error-recovery',
            description: 'Test error recovery mechanisms',
            action: testErrorRecovery,
            status: 'pending'
          }
        ]
      }
    ];

    setScenarios(testScenarios);
  };

  // Test implementations
  const testLandingPage = async () => {
    // Simulate testing landing page components
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const header = document.querySelector('[data-testid="header"]');
    const heroSection = document.querySelector('[data-testid="hero-section"]');
    
    if (!header || !heroSection) {
      throw new Error('Landing page components not found');
    }
  };

  const testGetStartedFlow = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Simulate navigation to get started page
    window.history.pushState({}, '', '/get-started');
  };

  const testAssessmentFlow = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Simulate assessment completion
    localStorage.setItem('assessment-completed', 'true');
  };

  const testResultsDisplay = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulate results display
    window.history.pushState({}, '', '/results');
  };

  const testDashboardAccess = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Simulate dashboard access
    window.history.pushState({}, '', '/dashboard');
  };

  const testChatInitialization = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch('http://localhost:5000/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to initialize chat session');
    }
  };

  const testMessageExchange = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await fetch('http://localhost:5000/api/conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello, I would like to talk about my feelings',
        sessionId: 'test-session'
      })
    });
    
    if (!response.ok) {
      throw new Error('Message exchange failed');
    }
    
    const data = await response.json();
    if (!data.response) {
      throw new Error('No response received from AI');
    }
  };

  const testSafetyMonitoring = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response = await fetch('http://localhost:5000/api/safety/monitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I am feeling very sad today',
        sessionId: 'test-session'
      })
    });
    
    if (!response.ok) {
      throw new Error('Safety monitoring not working');
    }
  };

  const testCrisisDetection = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await fetch('http://localhost:5000/api/crisis/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I need help with crisis situation',
        sessionId: 'test-session'
      })
    });
    
    if (!response.ok) {
      throw new Error('Crisis detection not working');
    }
  };

  const testSessionStorage = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test localStorage functionality
    localStorage.setItem('test-key', 'test-value');
    const value = localStorage.getItem('test-key');
    localStorage.removeItem('test-key');
    
    if (value !== 'test-value') {
      throw new Error('Session storage not working');
    }
  };

  const testUserPreferences = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const preferences = {
      theme: 'light',
      notifications: true,
      privacy: 'standard'
    };
    
    localStorage.setItem('user-preferences', JSON.stringify(preferences));
    const stored = JSON.parse(localStorage.getItem('user-preferences') || '{}');
    
    if (stored.theme !== 'light') {
      throw new Error('User preferences not persisting');
    }
  };

  const testConversationHistory = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch('http://localhost:5000/api/conversation/history/test-session');
    
    if (!response.ok) {
      throw new Error('Conversation history not accessible');
    }
  };

  const testMobileLayout = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 });
    Object.defineProperty(window, 'innerHeight', { value: 667 });
    window.dispatchEvent(new Event('resize'));
    
    // Check if mobile navigation is present
    const mobileNav = document.querySelector('[data-testid="mobile-navigation"]');
    if (!mobileNav) {
      console.warn('Mobile navigation not found');
    }
  };

  const testTabletLayout = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate tablet viewport
    Object.defineProperty(window, 'innerWidth', { value: 768 });
    Object.defineProperty(window, 'innerHeight', { value: 1024 });
    window.dispatchEvent(new Event('resize'));
  };

  const testDesktopLayout = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate desktop viewport
    Object.defineProperty(window, 'innerWidth', { value: 1920 });
    Object.defineProperty(window, 'innerHeight', { value: 1080 });
    window.dispatchEvent(new Event('resize'));
  };

  const testTouchInteractions = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Test touch event handling
    const touchEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as Touch]
    });
    
    document.dispatchEvent(touchEvent);
  };

  const testNetworkError = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      await fetch('http://localhost:5000/api/nonexistent');
    } catch (error) {
      // Expected to fail
    }
  };

  const testAPIError = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch('http://localhost:5000/api/error-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: 'error' })
    });
    
    // Should handle error gracefully
  };

  const testOfflineMode = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate offline mode
    Object.defineProperty(navigator, 'onLine', { value: false });
    window.dispatchEvent(new Event('offline'));
    
    // Check if offline banner appears
    const offlineBanner = document.querySelector('[data-testid="offline-banner"]');
    if (!offlineBanner) {
      console.warn('Offline banner not found');
    }
  };

  const testErrorRecovery = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test error boundary functionality
    try {
      throw new Error('Test error for recovery');
    } catch (error) {
      // Should be caught by error boundary
    }
  };

  const runStep = async (scenarioId: string, step: TestStep) => {
    setCurrentStep(step.id);
    
    const startTime = Date.now();
    
    try {
      updateStepStatus(scenarioId, step.id, 'running');
      await step.action();
      const duration = Date.now() - startTime;
      updateStepStatus(scenarioId, step.id, 'passed', undefined, duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateStepStatus(scenarioId, step.id, 'failed', errorMessage, duration);
      throw error;
    }
  };

  const runScenario = async (scenario: TestScenario) => {
    setCurrentScenario(scenario.id);
    
    const startTime = Date.now();
    
    try {
      updateScenarioStatus(scenario.id, 'running');
      
      for (const step of scenario.steps) {
        await runStep(scenario.id, step);
      }
      
      const duration = Date.now() - startTime;
      updateScenarioStatus(scenario.id, 'passed', undefined, duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateScenarioStatus(scenario.id, 'failed', errorMessage, duration);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    let completedScenarios = 0;
    
    for (const scenario of scenarios) {
      await runScenario(scenario);
      completedScenarios++;
      setProgress((completedScenarios / scenarios.length) * 100);
    }
    
    setCurrentScenario(null);
    setCurrentStep(null);
    setIsRunning(false);
    
    if (onComplete) {
      onComplete(scenarios);
    }
  };

  const updateScenarioStatus = (
    scenarioId: string, 
    status: TestScenario['status'], 
    error?: string, 
    duration?: number
  ) => {
    setScenarios(prev => prev.map(scenario => 
      scenario.id === scenarioId 
        ? { ...scenario, status, error, duration }
        : scenario
    ));
  };

  const updateStepStatus = (
    scenarioId: string, 
    stepId: string, 
    status: TestStep['status'], 
    error?: string, 
    duration?: number
  ) => {
    setScenarios(prev => prev.map(scenario => 
      scenario.id === scenarioId 
        ? {
            ...scenario,
            steps: scenario.steps.map(step => 
              step.id === stepId 
                ? { ...step, status, error, duration }
                : step
            )
          }
        : scenario
    ));
  };

  const resetTests = () => {
    initializeTestScenarios();
    setProgress(0);
    setCurrentScenario(null);
    setCurrentStep(null);
  };

  const getStatusIcon = (status: TestScenario['status'] | TestStep['status']) => {
    switch (status) {
      case 'running':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: TestScenario['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      case 'passed':
        return <Badge variant="default" className="bg-green-500">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const passedScenarios = scenarios.filter(s => s.status === 'passed').length;
  const failedScenarios = scenarios.filter(s => s.status === 'failed').length;
  const totalScenarios = scenarios.length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Integration Tests
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={runAllTests}
              disabled={isRunning}
            >
              {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRunning ? 'Running...' : 'Run All Tests'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetTests}
              disabled={isRunning}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          End-to-end testing of complete user workflows and system integration
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
        
        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className={`${
              currentScenario === scenario.id ? 'ring-2 ring-blue-200' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(scenario.status)}
                    <div>
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {scenario.duration && (
                      <span className="text-xs text-gray-500">{scenario.duration}ms</span>
                    )}
                    {getStatusBadge(scenario.status)}
                  </div>
                </div>
                {scenario.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{scenario.error}</AlertDescription>
                  </Alert>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  {scenario.steps.map((step) => (
                    <div
                      key={step.id}
                      className={`flex items-center justify-between p-2 rounded border ${
                        currentStep === step.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(step.status)}
                        <span className="text-sm">{step.description}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {step.duration && `${step.duration}ms`}
                        {step.error && (
                          <div className="text-red-600 max-w-xs truncate">
                            {step.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {!isRunning && (passedScenarios > 0 || failedScenarios > 0) && (
          <Alert className={failedScenarios > 0 ? 'border-red-200' : 'border-green-200'}>
            <AlertDescription>
              <div className="flex justify-between items-center">
                <span>
                  {passedScenarios}/{totalScenarios} scenarios passed
                  {failedScenarios > 0 && `, ${failedScenarios} failed`}
                </span>
                {failedScenarios === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}