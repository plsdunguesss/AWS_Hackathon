import { useState, useEffect } from 'react';
import { apiService, UserProfile, UserPreferences } from '../services/api';

export function useUserProfile(sessionId: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadUserData = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      // Load profile and preferences in parallel
      const [profileResponse, preferencesResponse] = await Promise.all([
        apiService.getUserProfile(sessionId),
        apiService.getUserPreferences(sessionId)
      ]);

      if (profileResponse.success && profileResponse.data) {
        setProfile(profileResponse.data.profile);
      } else {
        console.warn('Failed to load profile:', profileResponse.error);
      }

      if (preferencesResponse.success && preferencesResponse.data) {
        setPreferences(preferencesResponse.data.preferences);
      } else {
        console.warn('Failed to load preferences:', preferencesResponse.error);
      }

      // Only set error if both requests failed
      if (!profileResponse.success && !preferencesResponse.success) {
        setError('Failed to load user data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!sessionId) return { success: false, error: 'No session' };

    try {
      setSaving(true);
      const response = await apiService.updateUserProfile(sessionId, updates);
      
      if (response.success && response.data) {
        setProfile(response.data.profile);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update profile' 
      };
    } finally {
      setSaving(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!sessionId) return { success: false, error: 'No session' };

    try {
      setSaving(true);
      const response = await apiService.updateUserPreferences(sessionId, updates);
      
      if (response.success && response.data) {
        setPreferences(response.data.preferences);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update preferences' 
      };
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    if (!sessionId) return { success: false, error: 'No session' };

    try {
      const response = await apiService.exportUserData(sessionId);
      
      if (response.success && response.data) {
        // In a real app, this would trigger a download
        window.open(response.data.downloadUrl, '_blank');
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to export data' 
      };
    }
  };

  const deleteAccount = async () => {
    if (!sessionId) return { success: false, error: 'No session' };

    try {
      const response = await apiService.deleteUserData(sessionId);
      
      if (response.success) {
        // Clear local data
        setProfile(null);
        setPreferences(null);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete account' 
      };
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadUserData();
    }
  }, [sessionId]);

  return {
    profile,
    preferences,
    loading,
    error,
    saving,
    updateProfile,
    updatePreferences,
    exportData,
    deleteAccount,
    refreshData: loadUserData,
  };
}