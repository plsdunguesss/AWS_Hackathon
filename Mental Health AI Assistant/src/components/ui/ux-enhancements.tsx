import { useEffect, useState } from 'react';
import { Lightbulb, Zap, Heart, Shield } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSuggestedNextSteps } from './app-navigation';

interface UXEnhancementsProps {
  showSuggestions?: boolean;
  showQuickActions?: boolean;
  showProgressIndicator?: boolean;
}

export function UXEnhancements({ 
  showSuggestions = true, 
  showQuickActions = true,
  showProgressIndicator = true 
}: UXEnhancementsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userProgress, setUserProgress] = useState({
    completedAssessment: false,
    startedChat: false,
    viewedDashboard: false,
    exploredResources: false
  });

  useEffect(() => {
    // Track user progress through the application
    const progress = {
      completedAssessment: localStorage.getItem('assessment-completed') === 'true',
      startedChat: localStorage.getItem('chat-started') === 'true',
      viewedDashboard: localStorage.getItem('dashboard-viewed') === 'true',
      exploredResources: localStorage.getItem('resources-explored') === 'true'
    };
    setUserProgress(progress);
  }, [location.pathname]);

  const getProgressPercentage = () => {
    const completed = Object.values(userProgress).filter(Boolean).length;
    return (completed / Object.keys(userProgress).length) * 100;
  };

  const getContextualSuggestions = () => {
    const suggestions = getSuggestedNextSteps(location.pathname);
    
    // Add contextual suggestions based on user progress
    if (!userProgress.completedAssessment && location.pathname !== '/assessment') {
      suggestions.unshift({
        path: '/assessment',
        label: 'Take Assessment',
        description: 'Get personalized mental health insights'
      });
    }
    
    if (userProgress.completedAssessment && !userProgress.startedChat && location.pathname !== '/chat') {
      suggestions.unshift({
        path: '/chat',
        label: 'Start Chatting',
        description: 'Begin your journey with our AI assistant'
      });
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  };

  const getQuickActions = () => {
    const actions = [
      {
        icon: Heart,
        label: 'Crisis Help',
        description: 'Immediate support resources',
        action: () => navigate('/find-help'),
        variant: 'destructive' as const,
        urgent: true
      },
      {
        icon: Shield,
        label: 'Privacy Settings',
        description: 'Manage your data and privacy',
        action: () => navigate('/settings'),
        variant: 'outline' as const
      },
      {
        icon: Zap,
        label: 'Quick Assessment',
        description: 'Brief mental health check',
        action: () => navigate('/assessment'),
        variant: 'default' as const
      }
    ];

    // Filter actions based on current page
    return actions.filter(action => {
      if (action.label === 'Quick Assessment' && location.pathname === '/assessment') return false;
      if (action.label === 'Privacy Settings' && location.pathname === '/settings') return false;
      return true;
    });
  };

  const handleSuggestionClick = (path: string) => {
    navigate(path);
    
    // Track user actions for better suggestions
    switch (path) {
      case '/assessment':
        localStorage.setItem('assessment-started', 'true');
        break;
      case '/chat':
        localStorage.setItem('chat-started', 'true');
        break;
      case '/dashboard':
        localStorage.setItem('dashboard-viewed', 'true');
        break;
      case '/resources':
        localStorage.setItem('resources-explored', 'true');
        break;
    }
  };

  if (!showSuggestions && !showQuickActions && !showProgressIndicator) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      {showProgressIndicator && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              Your Journey Progress
            </CardTitle>
            <CardDescription>
              You've completed {Math.round(getProgressPercentage())}% of your initial setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant={userProgress.completedAssessment ? "default" : "secondary"}>
                  Assessment {userProgress.completedAssessment ? '✓' : '○'}
                </Badge>
                <Badge variant={userProgress.startedChat ? "default" : "secondary"}>
                  Chat Started {userProgress.startedChat ? '✓' : '○'}
                </Badge>
                <Badge variant={userProgress.viewedDashboard ? "default" : "secondary"}>
                  Dashboard {userProgress.viewedDashboard ? '✓' : '○'}
                </Badge>
                <Badge variant={userProgress.exploredResources ? "default" : "secondary"}>
                  Resources {userProgress.exploredResources ? '✓' : '○'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contextual Suggestions */}
      {showSuggestions && getContextualSuggestions().length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Suggested Next Steps</CardTitle>
            <CardDescription>
              Based on your current progress, here's what you might want to do next
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getContextualSuggestions().map((suggestion, index) => (
                <div
                  key={suggestion.path}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion.path)}
                >
                  <div>
                    <h4 className="font-medium">{suggestion.label}</h4>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Go
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {showQuickActions && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>
              Fast access to important features and resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {getQuickActions().map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.variant}
                    className={`h-auto p-4 flex flex-col items-center gap-2 ${
                      action.urgent ? 'ring-2 ring-red-200' : ''
                    }`}
                    onClick={action.action}
                  >
                    <Icon className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs opacity-80">{action.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Hook for tracking user interactions and improving UX
export function useUXTracking() {
  const location = useLocation();
  
  useEffect(() => {
    // Track page visits
    const visitKey = `visited-${location.pathname}`;
    const visitCount = parseInt(localStorage.getItem(visitKey) || '0') + 1;
    localStorage.setItem(visitKey, visitCount.toString());
    
    // Track time spent on page
    const startTime = Date.now();
    
    return () => {
      const timeSpent = Date.now() - startTime;
      const timeKey = `time-${location.pathname}`;
      const totalTime = parseInt(localStorage.getItem(timeKey) || '0') + timeSpent;
      localStorage.setItem(timeKey, totalTime.toString());
    };
  }, [location.pathname]);

  const getPageAnalytics = () => {
    const analytics = {
      visits: parseInt(localStorage.getItem(`visited-${location.pathname}`) || '0'),
      timeSpent: parseInt(localStorage.getItem(`time-${location.pathname}`) || '0'),
      averageTime: 0
    };
    
    if (analytics.visits > 0) {
      analytics.averageTime = analytics.timeSpent / analytics.visits;
    }
    
    return analytics;
  };

  return { getPageAnalytics };
}