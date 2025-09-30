import express from 'express';
import { UserService } from '../services/userService';
import { SessionService } from '../services/sessionService';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const userService = UserService.getInstance();
const sessionService = SessionService.getInstance();

/**
 * Get user profile
 */
router.get('/profile/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Validate session exists
    const session = await sessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'The specified session does not exist'
      });
    }

    const profile = await userService.getUserProfile(sessionId);
    
    res.json({
      profile: profile || {
        id: '',
        sessionId,
        firstName: '',
        lastName: '',
        email: '',
        bio: '',
        phone: '',
        avatarUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve user profile'
    });
  }
});

/**
 * Update user profile
 */
router.put('/profile/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const profileData = req.body;

    // Validate session exists
    const session = await sessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'The specified session does not exist'
      });
    }

    // Validate profile data
    const allowedFields = ['firstName', 'lastName', 'email', 'bio', 'phone', 'avatarUrl'];
    const filteredData: any = {};
    
    for (const field of allowedFields) {
      if (profileData[field] !== undefined) {
        filteredData[field] = profileData[field];
      }
    }

    // Basic email validation if provided
    if (filteredData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(filteredData.email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    const profile = await userService.upsertUserProfile(sessionId, filteredData);
    
    res.json({
      profile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update user profile'
    });
  }
});

/**
 * Get user preferences
 */
router.get('/preferences/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Validate session exists
    const session = await sessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'The specified session does not exist'
      });
    }

    const preferences = await userService.getUserPreferences(sessionId);
    
    res.json({
      preferences: preferences || {
        id: '',
        sessionId,
        theme: 'system',
        language: 'en',
        timezone: 'America/New_York',
        reminderTime: '09:00',
        weeklyReportDay: 'sunday',
        notifications: {
          checkInReminders: true,
          chatNotifications: true,
          appointmentReminders: true,
          weeklyReports: false,
          emergencyAlerts: true,
          marketingEmails: false
        },
        privacy: {
          dataSharing: false,
          anonymousResearch: true,
          profileVisibility: 'private' as const,
          activityTracking: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting user preferences:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve user preferences'
    });
  }
});

/**
 * Update user preferences
 */
router.put('/preferences/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const preferencesData = req.body;

    // Validate session exists
    const session = await sessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'The specified session does not exist'
      });
    }

    // Validate preferences data
    const allowedFields = ['theme', 'language', 'timezone', 'reminderTime', 'weeklyReportDay', 'notifications', 'privacy'];
    const filteredData: any = {};
    
    for (const field of allowedFields) {
      if (preferencesData[field] !== undefined) {
        filteredData[field] = preferencesData[field];
      }
    }

    // Validate theme
    if (filteredData.theme && !['light', 'dark', 'system'].includes(filteredData.theme)) {
      return res.status(400).json({
        error: 'Invalid theme',
        message: 'Theme must be one of: light, dark, system'
      });
    }

    // Validate privacy visibility
    if (filteredData.privacy?.profileVisibility && 
        !['private', 'healthcare', 'support'].includes(filteredData.privacy.profileVisibility)) {
      return res.status(400).json({
        error: 'Invalid profile visibility',
        message: 'Profile visibility must be one of: private, healthcare, support'
      });
    }

    const preferences = await userService.upsertUserPreferences(sessionId, filteredData);
    
    res.json({
      preferences
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update user preferences'
    });
  }
});

/**
 * Export user data
 */
router.post('/export/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Validate session exists
    const session = await sessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'The specified session does not exist'
      });
    }

    const userData = await userService.exportUserData(sessionId);
    
    // In a real application, you would:
    // 1. Generate a secure download token
    // 2. Store the data temporarily with the token
    // 3. Return a download URL that expires
    // 4. Clean up the temporary file after download
    
    // For this implementation, we'll create a temporary file and return a mock URL
    const exportData = {
      exportDate: new Date().toISOString(),
      sessionId,
      ...userData
    };

    // Create a temporary export file (in production, use a proper file storage service)
    const exportDir = path.join(process.cwd(), 'temp', 'exports');
    await fs.mkdir(exportDir, { recursive: true });
    
    const filename = `user-data-${sessionId}-${Date.now()}.json`;
    const filepath = path.join(exportDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));
    
    // In production, this would be a secure, time-limited download URL
    const downloadUrl = `/api/user/download/${filename}`;
    
    res.json({
      downloadUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      fileSize: (await fs.stat(filepath)).size
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to export user data'
    });
  }
});

/**
 * Download exported data (temporary endpoint for demo)
 */
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Basic security check - only allow specific pattern
    if (!/^user-data-[a-f0-9-]+-\d+\.json$/.test(filename)) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The requested file does not exist'
      });
    }

    const filepath = path.join(process.cwd(), 'temp', 'exports', filename);
    
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({
        error: 'File not found',
        message: 'The requested file does not exist or has expired'
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileContent = await fs.readFile(filepath);
    res.send(fileContent);
    
    // Clean up the file after download
    setTimeout(async () => {
      try {
        await fs.unlink(filepath);
      } catch (error) {
        console.error('Error cleaning up export file:', error);
      }
    }, 5000); // Delete after 5 seconds
    
  } catch (error) {
    console.error('Error downloading user data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to download user data'
    });
  }
});

/**
 * Delete user account and all data
 */
router.delete('/delete/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Validate session exists
    const session = await sessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'The specified session does not exist'
      });
    }

    // Delete all user data
    await userService.deleteUserData(sessionId);
    
    // Delete the session itself (this will cascade delete all related data)
    await sessionService.deleteSession(sessionId);
    
    res.json({
      success: true,
      message: 'User account and all associated data have been permanently deleted'
    });
  } catch (error) {
    console.error('Error deleting user data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete user data'
    });
  }
});

export { router as userRoutes };