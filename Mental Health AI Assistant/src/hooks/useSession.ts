import { useState, useEffect, useCallback } from 'react';
import { apiService, Session } from '../services/api';
import { useErrorHandler } from './useErrorHandler';
import { useOffline } from './useOffline';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleError, errorState, clearError, retry } = useErrorHandler({
    showToast: false, // Don't show toast for session errors
    maxRetries: 3,
  });

  const initializeSession = useCallback(async () => {
    // Prevent multiple simultaneous session creation
    if (loading || session) return;
    
    try {
      setLoading(true);
      clearError();

      // Check if we have a session ID in localStorage
      const existingSessionId = localStorage.getItem('mindcare_session_id');
      
      if (existingSessionId) {
        // Try to retrieve existing session
        try {
          const response = await apiService.getSession(existingSessionId);
          if (response.success && response.data?.session) {
            setSession(response.data.session);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.log('Existing session not found, creating new one');
        }
        // If session doesn't exist, remove from localStorage
        localStorage.removeItem('mindcare_session_id');
      }

      // Create new session
      const response = await apiService.createSession();
      if (response.success && response.data?.session) {
        setSession(response.data.session);
        localStorage.setItem('mindcare_session_id', response.data.session.id);
      } else {
        handleError(response.error || 'Failed to create session', 'api');
      }
    } catch (err) {
      const errorType = !navigator.onLine ? 'offline' : 'network';
      handleError(err instanceof Error ? err.message : 'Failed to initialize session', errorType);
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError, loading, session]);

  const retryInitialization = useCallback(async () => {
    const success = await retry(initializeSession);
    return success;
  }, [retry, initializeSession]);

  const clearSession = useCallback(() => {
    localStorage.removeItem('mindcare_session_id');
    setSession(null);
    clearError();
  }, [clearError]);

  // Auto-retry session initialization on network reconnection
  useEffect(() => {
    const handleOnline = () => {
      if (!session && !loading) {
        initializeSession();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [session, loading, initializeSession]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return {
    session,
    loading,
    error: errorState.error,
    errorType: errorState.type,
    initializeSession,
    retryInitialization,
    clearSession,
    canRetry: errorState.retryCount < 3,
  };
}