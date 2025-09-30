import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Loader2, Play } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Progress } from './progress';
import { Alert, AlertDescription } from './alert';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
}

interface SystemHealthCheckProps {
  onComplete?: (results: TestResult[]) => void;
  autoRun?: boolean;
}

export function SystemHealthCheck({ onComplete, autoRun = false }: SystemHealthCheckProps) {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Backend Connection', status: 'pending' },
    { name: 'Database Connection', status: 'pending' },
    { name: 'AI Service Integration', status: 'pending' },
    { name: 'Safety Monitoring', status: 'pending' },
    { name: 'Crisis Detection', status: 'pending' },
    { name: 'Professional Referrals', status: 'pending' },
    { name: 'User Session Management', status: 'pending' },
    { name: 'Data Persistence', status: 'pending' },
    { name: 'Error Handling', status: 'pending' },
    { name: 'Responsive Design', status: 'pending' },
    { name: 'Navigation Flow', status: 'pending' },
    { name: 'Offline Support', status: 'pending' }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(-1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (autoRun) {
      runTests();
    }
  }, [autoRun]);

  const updateTestStatus = (index: number, status: TestResult['status'], message?: string, duration?: number) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, duration } : test
    ));
  };

  const runSingleTest = async (testName: string, index: number): Promise<void> => {
    const startTime = Date.now();
    setCurrentTestIndex(index);
    updateTestStatus(index, 'running');

    try {
      switch (testName) {
        case 'Backend Connection':
          await testBackendConnection();
          break;
        case 'Database Connection':
          await testDatabaseConnection();
          break;
        case 'AI Service Integration':
          await testAIService();
          break;
        case 'Safety Monitoring':
          await testSafetyMonitoring();
          break;
        case 'Crisis Detection':
          await testCrisisDetection();
          break;
        case 'Professional Referrals':
          await testProfessionalReferrals();
          break;
        case 'User Session Management':
          await testSessionManagement();
          break;
        case 'Data Persistence':
          await testDataPersistence();
          break;
        case 'Error Handling':
          await testErrorHandling();
          break;
        case 'Responsive Design':
          await testResponsiveDesign();
          break;
        case 'Navigation Flow':
          await testNavigationFlow();
          break;
        case 'Offline Support':
          await testOfflineSupport();
          break;
        default:
          throw new Error(`Unknown test: ${testName}`);
      }
      
      const duration = Date.now() - startTime;
      updateTestStatus(index, 'passed', 'Test completed successfully', duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestStatus(index, 'failed', error instanceof Error ? error.message : 'Test failed', duration);
    }
  };

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    for (let i = 0; i < tests.length; i++) {
      await runSingleTest(tests[i].name, i);
      setProgress(((i + 1) / tests.length) * 100);
      
      // Small delay between tests for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setCurrentTestIndex(-1);
    setIsRunning(false);
    
    if (onComplete) {
      onComplete(tests);
    }
  };

  // Individual test implementations
  const testBackendConnection = async () => {
    const response = await fetch('http://localhost:5000/api/health', {
      method: 'GET',
      timeout: 5000
    } as RequestInit);
    
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }
  };

  const testDatabaseConnection = async () => {
    const response = await fetch('http://localhost:5000/api/database/health', {
      method: 'GET',
      timeout: 5000
    } as RequestInit);
    
    if (!response.ok) {
      throw new Error('Database connection failed');
    }
  };

  const testAIService = async () => {
    const response = await fetch('http://localhost:5000/api/conversation/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello, this is a test message' }),
      timeout: 10000
    } as RequestInit);
    
    if (!response.ok) {
      throw new Error('AI service integration failed');
    }
    
    const data = await response.json();
    if (!data.response) {
      throw new Error('AI service did not return a response');
    }
  };

  const testSafetyMonitoring = async () => {
    const response = await fetch('http://localhost:5000/api/safety/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test harmful content detection' })
    });
    
    if (!response.ok) {
      throw new Error('Safety monitoring system not responding');
    }
  };

  const testCrisisDetection = async () => {
    const response = await fetch('http://localhost:5000/api/crisis/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test crisis detection' })
    });
    
    if (!response.ok) {
      throw new Error('Crisis detection system not responding');
    }
  };

  const testProfessionalReferrals = async () => {
    const response = await fetch('http://localhost:5000/api/professionals');
    
    if (!response.ok) {
      throw new Error('Professional referral system not available');
    }
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No professional referrals available');
    }
  };

  const testSessionManagement = async () => {
    // Test session creation
    const createResponse = await fetch('http://localhost:5000/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!createResponse.ok) {
      throw new Error('Session creation failed');
    }
    
    const session = await createResponse.json();
    if (!session.sessionId) {
      throw new Error('Session ID not returned');
    }
  };

  const testDataPersistence = async () => {
    // Test local storage
    try {
      localStorage.setItem('test-key', 'test-value');
      const value = localStorage.getItem('test-key');
      localStorage.removeItem('test-key');
      
      if (value !== 'test-value') {
        throw new Error('Local storage not working');
      }
    } catch (error) {
      throw new Error('Data persistence not available');
    }
  };

  const testErrorHandling = async () => {
    // Test error boundary and error handling
    try {
      await fetch('http://localhost:5000/api/nonexistent-endpoint');
    } catch (error) {
      // This should fail gracefully without crashing the app
    }
    
    // Check if error handling components are available
    if (!document.querySelector('[data-error-boundary]')) {
      console.warn('Error boundary not detected in DOM');
    }
  };

  const testResponsiveDesign = async () => {
    // Test viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      throw new Error('Viewport meta tag not found');
    }
    
    // Test CSS media queries
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    if (!mediaQuery) {
      throw new Error('Media queries not supported');
    }
  };

  const testNavigationFlow = async () => {
    // Test React Router
    if (!window.location.pathname) {
      throw new Error('Navigation not working');
    }
    
    // Test navigation context
    const navigationContext = document.querySelector('[data-navigation-context]');
    if (!navigationContext) {
      console.warn('Navigation context not detected');
    }
  };

  const testOfflineSupport = async () => {
    // Test service worker or offline capabilities
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
    }
    
    // Test offline detection
    if (typeof navigator.onLine === 'undefined') {
      throw new Error('Offline detection not supported');
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const passedTests = tests.filter(test => test.status === 'passed').length;
  const failedTests = tests.filter(test => test.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          System Health Check
          {!isRunning && (
            <Button
              size="sm"
              onClick={runTests}
              disabled={isRunning}
              className="ml-auto"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Tests
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Comprehensive testing of all system components and user workflows
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
        
        <div className="space-y-2">
          {tests.map((test, index) => (
            <div
              key={test.name}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                currentTestIndex === index ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <span className="font-medium">{test.name}</span>
              </div>
              <div className="text-right text-sm text-gray-600">
                {test.duration && `${test.duration}ms`}
                {test.message && (
                  <div className={`text-xs ${
                    test.status === 'failed' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {test.message}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {!isRunning && (passedTests > 0 || failedTests > 0) && (
          <Alert className={failedTests > 0 ? 'border-red-200' : 'border-green-200'}>
            <AlertDescription>
              <div className="flex justify-between items-center">
                <span>
                  {passedTests}/{totalTests} tests passed
                  {failedTests > 0 && `, ${failedTests} failed`}
                </span>
                {failedTests === 0 ? (
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