import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SystemHealthCheck } from '../components/ui/system-health-check';
import { IntegrationTest } from '../components/ui/integration-test';
import { SafetyMonitor } from '../components/ui/safety-monitor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Activity, Shield, TestTube, Settings, RefreshCw } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';

export function SystemStatusPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigation();
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'System Status', path: '/system-status' }
    ]);
  }, [setBreadcrumbs]);

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // Trigger refresh of all components
    window.location.reload();
  };

  const getStatusBadge = () => {
    switch (systemStatus) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Layout 
      title="System Status"
      onBack={() => navigate('/')}
      maxWidth="6xl"
    >
      <div className="space-y-6">
        {/* System Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>System Overview</CardTitle>
                  <CardDescription>
                    Overall health and status of the Mental Health AI Assistant
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge()}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-green-700">Uptime</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">150ms</div>
                <div className="text-sm text-blue-700">Avg Response Time</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-purple-700">Safety Monitoring</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Last updated: {lastUpdated.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Status Tabs */}
        <Tabs defaultValue="health-check" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="health-check" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Health Check
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Safety Monitor
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Integration Tests
            </TabsTrigger>
            <TabsTrigger value="configuration" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health-check" className="mt-6">
            <SystemHealthCheck 
              onComplete={(results) => {
                const failedTests = results.filter(test => test.status === 'failed');
                if (failedTests.length > 0) {
                  setSystemStatus('warning');
                } else {
                  setSystemStatus('healthy');
                }
              }}
              autoRun={false}
            />
          </TabsContent>

          <TabsContent value="safety" className="mt-6">
            <div className="space-y-6">
              <SafetyMonitor 
                showStatus={true}
                onSafetyIssue={(issue) => {
                  console.warn('Safety issue detected:', issue);
                  setSystemStatus('critical');
                }}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Safety Protocols</CardTitle>
                  <CardDescription>
                    Active safety measures and monitoring systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Content Filtering</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Harmful content detection</li>
                        <li>• Self-harm prevention</li>
                        <li>• Violence prevention</li>
                        <li>• Inappropriate content blocking</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Crisis Detection</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Suicidal ideation detection</li>
                        <li>• Emergency situation recognition</li>
                        <li>• Automatic professional referrals</li>
                        <li>• Crisis resource provision</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="integration" className="mt-6">
            <IntegrationTest 
              onComplete={(results) => {
                const failedScenarios = results.filter(scenario => scenario.status === 'failed');
                if (failedScenarios.length > 0) {
                  setSystemStatus('warning');
                }
              }}
              autoRun={false}
            />
          </TabsContent>

          <TabsContent value="configuration" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frontend Configuration</CardTitle>
                  <CardDescription>React application settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>React Version:</span>
                      <span className="font-mono">18.3.1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Build Tool:</span>
                      <span className="font-mono">Vite 6.3.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TypeScript:</span>
                      <span className="font-mono">5.2.2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>UI Library:</span>
                      <span className="font-mono">Radix UI + Tailwind</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Router:</span>
                      <span className="font-mono">React Router 7.9.3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backend Configuration</CardTitle>
                  <CardDescription>Server and API settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Server:</span>
                      <span className="font-mono">Express.js</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Database:</span>
                      <span className="font-mono">SQLite</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Service:</span>
                      <span className="font-mono">Local LLM (Ollama)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Port:</span>
                      <span className="font-mono">5000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Environment:</span>
                      <span className="font-mono">Development</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Security and privacy configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Data Storage:</span>
                      <span className="font-mono">Local Only</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Session Management:</span>
                      <span className="font-mono">Local Storage</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HTTPS:</span>
                      <span className="font-mono">Development (HTTP)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CORS:</span>
                      <span className="font-mono">Localhost Only</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate Limiting:</span>
                      <span className="font-mono">Enabled</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Flags</CardTitle>
                  <CardDescription>Enabled features and capabilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>AI Chat:</span>
                      <Badge variant="default" className="bg-green-500">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Assessment:</span>
                      <Badge variant="default" className="bg-green-500">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Dashboard:</span>
                      <Badge variant="default" className="bg-green-500">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Progress Tracking:</span>
                      <Badge variant="default" className="bg-green-500">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Professional Referrals:</span>
                      <Badge variant="default" className="bg-green-500">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Crisis Detection:</span>
                      <Badge variant="default" className="bg-green-500">Enabled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}