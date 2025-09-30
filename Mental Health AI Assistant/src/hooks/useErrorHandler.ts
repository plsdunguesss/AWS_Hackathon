import { useState, useCallback } from 'react';
import { useToast } from '../components/ui/toast';

export interface ErrorState {
  error: string | null;
  type: 'network' | 'api' | 'validation' | 'critical' | 'offline';
  retryCount: number;
  lastRetry: Date | null;
}

export interface UseErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  showToast?: boolean;
  showCrisisResources?: boolean;
  onError?: (error: ErrorState) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 2000,
    showToast = true,
    showCrisisResources = false,
    onError,
  } = options;

  const { addToast } = useToast();
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    type: 'api',
    retryCount: 0,
    lastRetry: null,
  });

  const handleError = useCallback((
    error: string | Error,
    type: ErrorState['type'] = 'api',
    context?: Record<string, any>
  ) => {
    const errorMessage = error instanceof Error ? error.message : error;
    
    const newErrorState: ErrorState = {
      error: errorMessage,
      type,
      retryCount: errorState.retryCount,
      lastRetry: errorState.lastRetry,
    };

    setErrorState(newErrorState);

    // Log error for monitoring
    console.error('Error handled:', {
      error: errorMessage,
      type,
      context,
      timestamp: new Date().toISOString(),
    });

    // Show toast notification
    if (showToast) {
      const toastType = type === 'critical' ? 'error' : 
                      type === 'network' || type === 'offline' ? 'warning' : 'error';
      
      addToast({
        type: toastType,
        title: getErrorTitle(type),
        description: errorMessage,
        duration: type === 'critical' ? 0 : 5000, // Critical errors don't auto-dismiss
        action: showCrisisResources ? {
          label: 'Get Help',
          onClick: () => showCrisisResourcesModal(),
        } : undefined,
      });
    }

    // Call custom error handler
    if (onError) {
      onError(newErrorState);
    }
  }, [errorState, addToast, showToast, showCrisisResources, onError]);

  const retry = useCallback(async (retryFn: () => Promise<void>) => {
    if (errorState.retryCount >= maxRetries) {
      handleError('Maximum retry attempts reached', 'critical');
      return false;
    }

    try {
      setErrorState(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1,
        lastRetry: new Date(),
      }));

      // Add delay before retry
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      await retryFn();
      
      // Clear error on successful retry
      clearError();
      return true;
    } catch (error) {
      handleError(error as Error, errorState.type);
      return false;
    }
  }, [errorState, maxRetries, retryDelay, handleError]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      type: 'api',
      retryCount: 0,
      lastRetry: null,
    });
  }, []);

  const canRetry = errorState.retryCount < maxRetries;

  return {
    errorState,
    handleError,
    retry,
    clearError,
    canRetry,
    isError: !!errorState.error,
  };
}

function getErrorTitle(type: ErrorState['type']): string {
  switch (type) {
    case 'network':
      return 'Connection Issue';
    case 'offline':
      return 'You\'re Offline';
    case 'critical':
      return 'Critical Error';
    case 'validation':
      return 'Validation Error';
    default:
      return 'Error';
  }
}

function showCrisisResourcesModal() {
  // In a real app, this would open a modal with crisis resources
  const crisisResources = [
    { name: '988 Suicide & Crisis Lifeline', number: '988', url: 'https://988lifeline.org' },
    { name: 'Crisis Text Line', number: '741741', text: 'HOME' },
    { name: 'Emergency Services', number: '911' },
  ];

  const message = crisisResources.map(resource => 
    resource.text 
      ? `${resource.name}: Text "${resource.text}" to ${resource.number}`
      : `${resource.name}: ${resource.number}`
  ).join('\n');

  alert(`Crisis Resources:\n\n${message}`);
}

// Hook for handling async operations with error handling
export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  options: UseErrorHandlerOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const errorHandler = useErrorHandler(options);

  const execute = useCallback(async (...args: any[]) => {
    try {
      setLoading(true);
      errorHandler.clearError();
      
      const result = await operation();
      setData(result);
      return result;
    } catch (error) {
      errorHandler.handleError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [operation, errorHandler]);

  const executeWithRetry = useCallback(async (...args: any[]) => {
    const success = await errorHandler.retry(() => execute(...args));
    return success;
  }, [execute, errorHandler]);

  return {
    loading,
    data,
    execute,
    executeWithRetry,
    ...errorHandler,
  };
}

// Hook for form validation errors
export function useFormErrors() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setFieldError = useCallback((field: string, error: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const hasErrors = Object.keys(fieldErrors).length > 0;
  const getFieldError = useCallback((field: string) => fieldErrors[field], [fieldErrors]);

  return {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors,
    getFieldError,
  };
}