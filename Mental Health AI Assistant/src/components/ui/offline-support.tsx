import { useState, useEffect } from 'react';
import { WifiOff, Download, Upload, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Progress } from './progress';
import { Alert, AlertDescription } from './alert';
import { useNetworkStatus, useOfflineQueue } from '../../hooks/useOffline';

interface OfflineSupportProps {
  queueSize?: number;
  onSync?: () => void;
  showDetails?: boolean;
}

export function OfflineSupport({ 
  queueSize = 0, 
  onSync, 
  showDetails = false 
}: OfflineSupportProps) {
  const { isOnline, connectionType, isSlowConnection } = useNetworkStatus();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineMessage(true);
    } else {
      // Hide message after a delay when coming back online
      const timer = setTimeout(() => setShowOfflineMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showOfflineMessage && isOnline && queueSize === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Offline Status */}
      {!isOnline && (
        <Alert className="border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>You're offline</strong>
                <p className="text-sm mt-1">
                  Your data is being saved locally and will sync when you reconnect.
                </p>
              </div>
              {queueSize > 0 && (
                <Badge variant="secondary" className="ml-4">
                  {queueSize} items queued
                </Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Slow Connection Warning */}
      {isOnline && isSlowConnection && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Slow connection detected</strong>
            <p className="text-sm mt-1">
              Some features may load slowly. Data is being cached for offline use.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Sync Queue Status */}
      {queueSize > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Sync Queue</span>
            </div>
            <Badge variant={isOnline ? 'default' : 'secondary'}>
              {queueSize} items
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {isOnline 
              ? 'Items are being synced automatically'
              : 'Items will sync when connection is restored'
            }
          </p>
          
          {isOnline && onSync && (
            <Button size="sm" onClick={onSync} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Sync Now
            </Button>
          )}
        </Card>
      )}

      {/* Connection Restored */}
      {isOnline && showOfflineMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Connection restored!</strong>
            {queueSize > 0 && (
              <p className="text-sm mt-1">
                Syncing {queueSize} queued items...
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Status */}
      {showDetails && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Connection Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            {isOnline && (
              <div className="flex justify-between">
                <span>Connection:</span>
                <span className="capitalize">{connectionType}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Queued Items:</span>
              <span>{queueSize}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// Offline indicator for navigation/header
export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
      <WifiOff className="h-3 w-3" />
      <span>Offline</span>
    </div>
  );
}

// Sync progress indicator
export function SyncProgress({ 
  syncing, 
  progress, 
  total 
}: { 
  syncing: boolean; 
  progress: number; 
  total: number; 
}) {
  if (!syncing || total === 0) return null;

  const percentage = Math.round((progress / total) * 100);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <Upload className="h-4 w-4 text-blue-600 animate-pulse" />
        <span className="font-medium">Syncing data...</span>
      </div>
      
      <Progress value={percentage} className="mb-2" />
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{progress} of {total} items</span>
        <span>{percentage}%</span>
      </div>
    </Card>
  );
}

// Offline data cache info
export function CacheInfo({ 
  lastSync, 
  cacheSize, 
  onClearCache 
}: { 
  lastSync?: Date; 
  cacheSize?: string; 
  onClearCache?: () => void; 
}) {
  return (
    <Card className="p-4">
      <h4 className="font-medium mb-3">Offline Data</h4>
      <div className="space-y-2 text-sm">
        {lastSync && (
          <div className="flex justify-between">
            <span>Last sync:</span>
            <span>{lastSync.toLocaleString()}</span>
          </div>
        )}
        {cacheSize && (
          <div className="flex justify-between">
            <span>Cache size:</span>
            <span>{cacheSize}</span>
          </div>
        )}
      </div>
      
      {onClearCache && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearCache}
          className="w-full mt-3"
        >
          Clear Cache
        </Button>
      )}
    </Card>
  );
}

// Crisis resources available offline
export function OfflineCrisisResources() {
  return (
    <Card className="p-4 border-red-200 bg-red-50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-red-800 mb-2">Crisis Resources (Always Available)</h4>
          <div className="space-y-2 text-sm text-red-700">
            <div>
              <strong>Emergency:</strong> Call 911
            </div>
            <div>
              <strong>Crisis Lifeline:</strong> Call or text 988
            </div>
            <div>
              <strong>Crisis Text Line:</strong> Text HOME to 741741
            </div>
          </div>
          <p className="text-xs text-red-600 mt-2">
            These resources work even when you're offline
          </p>
        </div>
      </div>
    </Card>
  );
}