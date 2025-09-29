import { useState, useEffect } from 'react';
import { apiService, Session } from '../services/api';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have a session ID in localStorage
      const existingSessionId = localStorage.getItem('mindcare_session_id');
      
      if (existingSessionId) {
        // Try to retrieve existing session
        const response = await apiService.getSession(existingSessionId);
        if (response.success && response.data?.session) {
          setSession(response.data.session);
          setLoading(false);
          return;
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
        setError(response.error || 'Failed to create session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize session');
    } finally {
      setLoading(false);
    }
  };

  const clearSession = () => {
    localStorage.removeItem('mindcare_session_id');
    setSession(null);
    setError(null);
  };

  return {
    session,
    loading,
    error,
    initializeSession,
    clearSession,
  };
}