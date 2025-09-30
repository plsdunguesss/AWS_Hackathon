import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '../components/ui/toast';

export interface ErrorRecoveryState {
  isRecovering: boolean;
  recoveryAttempts: number;
  lastError: Error | null;
  recoveryStrategies: string[];
}

export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  onRecoverySuccess?: () => void;
  onRecoveryFailure?: (error: Error) => void;
  customStrategies?: Array<{
    name: string;
    condition: (error: Error) => boolean;
    action: () => Promise<void>;
  }>;
}

export function useErrorRecovery(options: ErrorRecoveryOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onRecoverySuccess,
    onRecoveryFailure,
    customStrategies = [],
  } = options;

  const { addToast } = useToast();
  const [recoveryState, setRecoveryState] = useState<ErrorRecoveryState>({
    isRecovering: false,
    recoveryAttempts: 0,
    lastError: null,
    recoveryStrategies: [],
  });

  const recoveryTimeoutRef = useRef<NodeJS.Timeout>();

  const clearRecoveryTimeout = useCallback(() => {
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = undefined;
    }
  }, []);

  const getRecoveryDelay = useCallback((attempt: number) => {
    if (!exponentialBackoff) return retryDelay;
    return retryDelay * Math.pow(2, attempt);
  }, [retryDelay, exponentialBackoff]);

  const getRecoveryStrategies = useCallback((error: Error): string[] => {
    const strategies: string[] = [];

    // Network-related errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      strategies.push('Check internet connection');
      strategies.push('Retry request');
      strategies.push('Use cached data');
    }

    // Timeout errors
    if (error.message.includes('timeout') || error.name === 'AbortError') {
      strategies.push('Increase timeout duration');
      strategies.push('Retry with longer timeout');
      strategies.push('Break request into smaller parts');
    }

    // Server errors
    if (error.message.includes('500') || error.message.includes('server')) {
      strategies.push('Wait and retry');
      strategies.push('Use fallback service');
      strategies.push('Contact support');
    }

    // Authentication errors
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      strategies.push('Refresh authentication');
      strategies.push('Re-login');
      strategies.push('Clear session data');
    }

    // Rate limiting
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      strategies.push('Wait before retrying');
      strategies.push('Reduce request frequency');
      strategies.push('Use exponential backoff');
    }

    // Custom strategies
    customStrategies.forEach(strategy => {
      if (strategy.condition(error)) {
        strategies.push(strategy.name);
      }
    });

    return strategies;
  }, [customStrategies]);

  const executeRecoveryStrategy = useCallback(async (
    error: Error,
    strategyName: string
  ): Promise<boolean> => {
    try {
      // Find and execute custom strategy
      const customStrategy = customStrategies.find(s => s.name === strategyName);
      if (customStrategy) {
        await customStrategy.action();
        return true;
      }

      // Built-in recovery strategies
      switch (strategyName) {
        case 'Check internet connection':
          // Check if navigator.onLine changed
          if (!navigator.onLine) {
            throw new Error('Still offline');
          }
          return true;

        case 'Use cached data':
          // This would be handled by the calling component
          addToast({
            type: 'info',
            description: 'Using cached data while connection is restored',
          });
          return true;

        case 'Refresh authentication':
          // Clear any auth tokens and redirect to login
          localStorage.removeItem('mindcare_session_id');
          window.location.reload();
          return true;

        case 'Clear session data':
          // Clear all session-related data
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('mindcare_') || key.startsWith('api_cache_')) {
              localStorage.removeItem(key);
            }
          });
          return true;

        case 'Wait and retry':
          // Just wait - the retry will happen automatically
          return true;

        default:
          return false;
      }
    } catch (strategyError) {
      console.error(`Recovery strategy "${strategyName}" failed:`, strategyError);
      return false;
    }
  }, [customStrategies, addToast]);

  const attemptRecovery = useCallback(async (
    error: Error,
    retryFunction: () => Promise<void>
  ): Promise<boolean> => {
    if (recoveryState.isRecovering) {
      return false; // Already recovering
    }

    const strategies = getRecoveryStrategies(error);
    
    setRecoveryState(prev => ({
      ...prev,
      isRecovering: true,
      lastError: error,
      recoveryStrategies: strategies,
    }));

    try {
      // Try each recovery strategy
      for (const strategy of strategies) {
        const success = await executeRecoveryStrategy(error, strategy);
        if (success) {
          break;
        }
      }

      // Wait before retry
      const delay = getRecoveryDelay(recoveryState.recoveryAttempts);
      await new Promise(resolve => {
        recoveryTimeoutRef.current = setTimeout(resolve, delay);
      });

      // Attempt the original operation
      await retryFunction();

      // Recovery successful
      setRecoveryState(prev => ({
        ...prev,
        isRecovering: false,
        recoveryAttempts: 0,
        lastError: null,
      }));

      addToast({
        type: 'success',
        description: 'Connection restored successfully',
      });

      if (onRecoverySuccess) {
        onRecoverySuccess();
      }

      return true;
    } catch (retryError) {
      const newAttempts = recoveryState.recoveryAttempts + 1;
      
      setRecoveryState(prev => ({
        ...prev,
        isRecovering: false,
        recoveryAttempts: newAttempts,
        lastError: retryError as Error,
      }));

      if (newAttempts >= maxRetries) {
        addToast({
          type: 'error',
          title: 'Recovery Failed',
          description: 'Unable to restore connection after multiple attempts',
          action: {
            label: 'Contact Support',
            onClick: () => {
              // Open support contact
              window.open('mailto:support@mindcare.ai?subject=Connection%20Issue', '_blank');
            },
          },
        });

        if (onRecoveryFailure) {
          onRecoveryFailure(retryError as Error);
        }
      } else {
        addToast({
          type: 'warning',
          description: `Recovery attempt ${newAttempts} failed. Trying again...`,
        });
      }

      return false;
    }
  }, [
    recoveryState,
    getRecoveryStrategies,
    executeRecoveryStrategy,
    getRecoveryDelay,
    maxRetries,
    addToast,
    onRecoverySuccess,
    onRecoveryFailure,
  ]);

  const resetRecovery = useCallback(() => {
    clearRecoveryTimeout();
    setRecoveryState({
      isRecovering: false,
      recoveryAttempts: 0,
      lastError: null,
      recoveryStrategies: [],
    });
  }, [clearRecoveryTimeout]);

  const canRetry = recoveryState.recoveryAttempts < maxRetries;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRecoveryTimeout();
    };
  }, [clearRecoveryTimeout]);

  return {
    recoveryState,
    attemptRecovery,
    resetRecovery,
    canRetry,
    isRecovering: recoveryState.isRecovering,
  };
}

// Hook for automatic error recovery with circuit breaker pattern
export function useCircuitBreaker(
  operation: () => Promise<any>,
  options: {
    failureThreshold?: number;
    resetTimeout?: number;
    monitoringPeriod?: number;
  } = {}
) {
  const {
    failureThreshold = 5,
    resetTimeout = 60000, // 1 minute
    monitoringPeriod = 300000, // 5 minutes
  } = options;

  const [state, setState] = useState<'closed' | 'open' | 'half-open'>('closed');
  const [failures, setFailures] = useState(0);
  const [lastFailureTime, setLastFailureTime] = useState<Date | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(async () => {
    // If circuit is open, check if we should try half-open
    if (state === 'open') {
      if (lastFailureTime && Date.now() - lastFailureTime.getTime() > resetTimeout) {
        setState('half-open');
      } else {
        throw new Error('Circuit breaker is open - service unavailable');
      }
    }

    try {
      const result = await operation();
      
      // Success - reset circuit breaker
      if (state === 'half-open') {
        setState('closed');
        setFailures(0);
        setLastFailureTime(null);
      }
      
      return result;
    } catch (error) {
      const newFailures = failures + 1;
      setFailures(newFailures);
      setLastFailureTime(new Date());

      // Open circuit if threshold reached
      if (newFailures >= failureThreshold) {
        setState('open');
        
        // Set timeout to try half-open state
        resetTimeoutRef.current = setTimeout(() => {
          setState('half-open');
        }, resetTimeout);
      }

      throw error;
    }
  }, [state, failures, lastFailureTime, operation, failureThreshold, resetTimeout]);

  // Reset failure count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (failures > 0 && state === 'closed') {
        setFailures(0);
      }
    }, monitoringPeriod);

    return () => {
      clearInterval(interval);
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [failures, state, monitoringPeriod]);

  const reset = useCallback(() => {
    setState('closed');
    setFailures(0);
    setLastFailureTime(null);
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
  }, []);

  return {
    execute,
    state,
    failures,
    reset,
    isOpen: state === 'open',
  };
}