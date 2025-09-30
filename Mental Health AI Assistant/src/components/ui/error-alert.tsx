import { AlertTriangle, Wifi, WifiOff, RefreshCw, X, Phone, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { Card } from './card';
import { cn } from '../../lib/utils';

interface ErrorAlertProps {
  error: string;
  type?: 'network' | 'api' | 'validation' | 'critical' | 'offline';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showCrisisResources?: boolean;
}

export function ErrorAlert({ 
  error, 
  type = 'api', 
  onRetry, 
  onDismiss, 
  className,
  showCrisisResources = false 
}: ErrorAlertProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: WifiOff,
          title: 'Connection Issue',
          variant: 'default' as const,
          color: 'border-orange-200 bg-orange-50',
          iconColor: 'text-orange-600',
          textColor: 'text-orange-800',
        };
      case 'offline':
        return {
          icon: WifiOff,
          title: 'You\'re Offline',
          variant: 'default' as const,
          color: 'border-gray-200 bg-gray-50',
          iconColor: 'text-gray-600',
          textColor: 'text-gray-800',
        };
      case 'critical':
        return {
          icon: AlertTriangle,
          title: 'Critical Error',
          variant: 'destructive' as const,
          color: 'border-red-200 bg-red-50',
          iconColor: 'text-red-600',
          textColor: 'text-red-800',
        };
      case 'validation':
        return {
          icon: AlertTriangle,
          title: 'Validation Error',
          variant: 'default' as const,
          color: 'border-yellow-200 bg-yellow-50',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-800',
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Error',
          variant: 'default' as const,
          color: 'border-orange-200 bg-orange-50',
          iconColor: 'text-orange-600',
          textColor: 'text-orange-800',
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <Alert className={cn(config.color, className)}>
      <Icon className={cn("h-4 w-4", config.iconColor)} />
      <AlertDescription className={config.textColor}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <strong>{config.title}:</strong> {error}
            
            {showCrisisResources && (
              <div className="mt-3 p-3 bg-white/50 rounded border">
                <p className="text-sm font-medium mb-2">If you're in crisis, get help immediately:</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Phone className="mr-1 h-3 w-3" />
                    Call 988
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <MessageSquare className="mr-1 h-3 w-3" />
                    Text HOME to 741741
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {onRetry && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onRetry}
                className="text-xs"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onDismiss}
                className="text-xs p-1"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Network status indicator
export function NetworkStatus({ isOnline }: { isOnline: boolean }) {
  if (isOnline) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Wifi className="h-4 w-4" />
        <span className="text-sm">Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-red-600">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm">Offline</span>
    </div>
  );
}

// Offline banner
export function OfflineBanner({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="bg-gray-800 text-white p-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <WifiOff className="h-5 w-5" />
          <div>
            <p className="font-medium">You're currently offline</p>
            <p className="text-sm text-gray-300">Some features may not be available</p>
          </div>
        </div>
        {onRetry && (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
        )}
      </div>
    </div>
  );
}

// Error page component
export function ErrorPage({ 
  title = "Something went wrong",
  message = "We're sorry, but something unexpected happened.",
  onRetry,
  onGoHome,
  showCrisisResources = true 
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showCrisisResources?: boolean;
}) {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-6">{message}</p>

          {showCrisisResources && (
            <Alert className="mb-6 text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>If you're in crisis:</strong> Please contact emergency services (911) 
                or call the 988 Suicide & Crisis Lifeline immediately.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            {onGoHome && (
              <Button variant="outline" onClick={onGoHome} className="w-full">
                Go to Home
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}