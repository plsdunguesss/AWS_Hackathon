import { useState } from 'react';
import { AlertTriangle, Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ErrorAlert, OfflineBanner, NetworkStatus } from './ui/error-alert';
import { LoadingSpinner, PageLoader, CardSkeleton, ListItemSkeleton } from './ui/loading-spinner';
import { SuccessFeedback, InlineSuccess, SuccessCard, ProgressSuccess, StreakSuccess } from './ui/success-feedback';
import { OfflineSupport, OfflineIndicator, SyncProgress, CacheInfo, OfflineCrisisResources } from './ui/offline-support';
import { useToast } from './ui/toast';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useNetworkStatus } from '../hooks/useOffline';

export function ErrorHandlingDemo() {
  const [demoState, setDemoState] = useState<'normal' | 'loading' | 'error' | 'offline' | 'success'>('normal');
  const [errorType, setErrorType] = useState<'network' | 'api' | 'critical' | 'validation'>('network');
  const { addToast } = useToast();
  const { isOnline } = useNetworkStatus();
  const { handleError, errorState, clearError } = useErrorHandler();

  const simulateError = (type: typeof errorType) => {
    setErrorType(type);
    setDemoState('error');
    
    const errorMessages = {
      network: 'Unable to connect to server. Please check your internet connection.',
      api: 'The service is temporarily unavailable. Please try again later.',
      critical: 'A critical error occurred. Please contact support immediately.',
      validation: 'Please check your input and try again.',
    };

    handleError(errorMessages[type], type);
  };

  const simulateSuccess = (type: 'mood' | 'achievement' | 'milestone' | 'connection') => {
    setDemoState('success');
    
    const successMessages = {
      mood: 'Your mood entry has been saved successfully!',
      achievement: 'Congratulations! You\'ve unlocked a new achievement.',
      milestone: 'Amazing! You\'ve reached a new milestone in your journey.',
      connection: 'Successfully connected to MindCare AI Assistant.',
    };

    addToast({
      type: 'success',
      title: type === 'achievement' ? 'Achievement Unlocked!' : undefined,
      description: successMessages[type],
    });
  };

  const simulateOffline = () => {
    setDemoState('offline');
    addToast({
      type: 'warning',
      description: 'You are now offline. Data will be saved locally.',
    });
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Error Handling & Loading States Demo</h1>
        <p className="text-muted-foreground">
          Test comprehensive error handling, loading states, and user feedback
        </p>
      </div>

      {/* Demo Controls */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Demo Controls</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium">Loading States</h3>
            <Button 
              onClick={() => setDemoState('loading')} 
              variant="outline" 
              className="w-full"
            >
              Show Loading
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Error Types</h3>
            <div className="space-y-1">
              <Button 
                onClick={() => simulateError('network')} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Network Error
              </Button>
              <Button 
                onClick={() => simulateError('api')} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                API Error
              </Button>
              <Button 
                onClick={() => simulateError('critical')} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Critical Error
              </Button>
              <Button 
                onClick={() => simulateError('validation')} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Validation Error
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Success Types</h3>
            <div className="space-y-1">
              <Button 
                onClick={() => simulateSuccess('mood')} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Mood Saved
              </Button>
              <Button 
                onClick={() => simulateSuccess('achievement')} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Achievement
              </Button>
              <Button 
                onClick={() => simulateSuccess('milestone')} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Milestone
              </Button>
              <Button 
                onClick={() => simulateSuccess('connection')} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Connected
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={() => setDemoState('normal')} variant="secondary">
            Reset Demo
          </Button>
          <Button onClick={() => clearError()} variant="outline">
            Clear Errors
          </Button>
        </div>
      </Card>

      {/* Network Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Network Status</h3>
          <div className="flex items-center gap-4">
            <NetworkStatus isOnline={isOnline} />
            <OfflineIndicator />
          </div>
        </div>
      </Card>

      {/* Demo Content */}
      {demoState === 'loading' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Loading States</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-medium mb-4">Page Loaders</h3>
              <div className="space-y-4">
                <LoadingSpinner size="lg" text="Loading dashboard..." variant="analytics" />
                <LoadingSpinner size="md" text="Connecting to chat..." variant="chat" />
                <LoadingSpinner size="sm" text="Saving..." variant="heart" />
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-4">Skeleton Loaders</h3>
              <div className="space-y-4">
                <CardSkeleton />
                <ListItemSkeleton count={2} />
              </div>
            </Card>
          </div>
        </div>
      )}

      {demoState === 'error' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Error States</h2>
          
          <ErrorAlert
            error={errorState.error || 'Sample error message'}
            type={errorType}
            onRetry={() => {
              addToast({
                type: 'info',
                description: 'Retrying operation...',
              });
              setTimeout(() => setDemoState('normal'), 2000);
            }}
            onDismiss={() => setDemoState('normal')}
            showCrisisResources={errorType === 'critical'}
          />

          {errorType === 'critical' && (
            <OfflineCrisisResources />
          )}
        </div>
      )}

      {demoState === 'success' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Success States</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <SuccessFeedback
                type="mood"
                message="Your daily mood check-in has been recorded successfully!"
                action={{
                  label: 'View Progress',
                  onClick: () => addToast({ type: 'info', description: 'Opening progress page...' }),
                }}
              />

              <InlineSuccess message="Settings saved successfully" />

              <ProgressSuccess
                current={7}
                total={14}
                label="Daily Check-in Streak"
              />
            </div>

            <div className="space-y-4">
              <SuccessCard
                title="7-Day Streak!"
                description="You've completed daily check-ins for a full week. Keep up the great work!"
                badge="Consistency Champion"
                actions={[
                  {
                    label: 'Share Achievement',
                    onClick: () => addToast({ type: 'info', description: 'Sharing achievement...' }),
                  },
                  {
                    label: 'View Progress',
                    onClick: () => addToast({ type: 'info', description: 'Opening progress...' }),
                    variant: 'outline',
                  },
                ]}
              />

              <StreakSuccess days={7} type="check-in" />
            </div>
          </div>
        </div>
      )}

      {demoState === 'offline' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Offline Support</h2>
          
          <OfflineBanner onRetry={() => setDemoState('normal')} />
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <OfflineSupport
                queueSize={3}
                onSync={() => addToast({ type: 'info', description: 'Syncing data...' })}
                showDetails={true}
              />

              <SyncProgress syncing={true} progress={2} total={3} />
            </div>

            <div className="space-y-4">
              <CacheInfo
                lastSync={new Date(Date.now() - 5 * 60 * 1000)}
                cacheSize="2.3 MB"
                onClearCache={() => addToast({ type: 'info', description: 'Cache cleared' })}
              />

              <OfflineCrisisResources />
            </div>
          </div>
        </div>
      )}

      {demoState === 'normal' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Normal State</h2>
          <Card className="p-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-medium mb-2">Everything is working normally</h3>
              <p className="text-muted-foreground">
                Use the demo controls above to test different states and error conditions.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Toast Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Toast Notifications</h2>
        <div className="grid md:grid-cols-4 gap-2">
          <Button
            onClick={() => addToast({ type: 'success', description: 'Operation completed successfully!' })}
            variant="outline"
            size="sm"
          >
            Success Toast
          </Button>
          <Button
            onClick={() => addToast({ type: 'error', description: 'Something went wrong!' })}
            variant="outline"
            size="sm"
          >
            Error Toast
          </Button>
          <Button
            onClick={() => addToast({ type: 'warning', description: 'Please check your input.' })}
            variant="outline"
            size="sm"
          >
            Warning Toast
          </Button>
          <Button
            onClick={() => addToast({ type: 'info', description: 'Here\'s some helpful information.' })}
            variant="outline"
            size="sm"
          >
            Info Toast
          </Button>
        </div>
      </Card>
    </div>
  );
}