import { useState, useEffect } from "react";
import { User, Bell, Shield, Palette, HelpCircle, LogOut, Edit, Trash2, Download, Upload, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { Textarea } from "./ui/textarea";
import { useSession } from "../hooks/useSession";
import { useUserProfile } from "../hooks/useUserProfile";

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { session } = useSession();
  const { 
    profile, 
    preferences, 
    loading, 
    error, 
    saving, 
    updateProfile, 
    updatePreferences, 
    exportData, 
    deleteAccount 
  } = useUserProfile(session?.id || null);

  // Local state for form inputs
  const [localProfile, setLocalProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    phone: ""
  });

  const [localPreferences, setLocalPreferences] = useState({
    theme: "system",
    language: "en",
    timezone: "America/New_York",
    reminderTime: "09:00",
    weeklyReportDay: "sunday",
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
      profileVisibility: "private" as const,
      activityTracking: true
    }
  });

  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Update local state when backend data loads
  useEffect(() => {
    if (profile) {
      setLocalProfile({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        bio: profile.bio || "",
        phone: profile.phone || ""
      });
    }
  }, [profile]);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(prev => ({
        ...prev,
        ...preferences
      }));
    }
  }, [preferences]);

  const handleProfileUpdate = (field: string, value: string) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (setting: string) => {
    setLocalPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [setting]: !prev.notifications[setting as keyof typeof prev.notifications]
      }
    }));
  };

  const handlePrivacyToggle = (setting: string) => {
    setLocalPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [setting]: !prev.privacy[setting as keyof typeof prev.privacy]
      }
    }));
  };

  const handlePreferenceChange = (setting: string, value: string) => {
    setLocalPreferences(prev => ({ ...prev, [setting]: value }));
  };

  const handleSaveProfile = async () => {
    const result = await updateProfile(localProfile);
    if (result.success) {
      setSaveStatus({ type: 'success', message: 'Profile updated successfully!' });
    } else {
      setSaveStatus({ type: 'error', message: result.error || 'Failed to update profile' });
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleSavePreferences = async () => {
    const result = await updatePreferences(localPreferences);
    if (result.success) {
      setSaveStatus({ type: 'success', message: 'Preferences saved successfully!' });
    } else {
      setSaveStatus({ type: 'error', message: result.error || 'Failed to save preferences' });
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleExportData = async () => {
    const result = await exportData();
    if (result.success) {
      setSaveStatus({ type: 'success', message: 'Data export initiated!' });
    } else {
      setSaveStatus({ type: 'error', message: result.error || 'Failed to export data' });
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      const result = await deleteAccount();
      if (result.success) {
        setSaveStatus({ type: 'success', message: 'Account deletion initiated' });
        // In a real app, this would redirect to a goodbye page
      } else {
        setSaveStatus({ type: 'error', message: result.error || 'Failed to delete account' });
      }
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
          <p className="text-lg font-medium">Loading your settings...</p>
          <p className="text-sm text-muted-foreground">Retrieving your profile and preferences</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30">
      {/* Header */}
      <div className="border-b bg-card mb-6">
        <div className="px-4 py-4">
          <div>
            <h1 className="text-2xl">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {(error || saveStatus) && (
        <div className="px-4 pt-4">
          {error && (
            <Alert className="border-orange-200 bg-orange-50 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Connection Issue:</strong> {error}. Changes may not be saved.
              </AlertDescription>
            </Alert>
          )}
          {saveStatus && (
            <Alert className={saveStatus.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertTriangle className={`h-4 w-4 ${saveStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
              <AlertDescription className={saveStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {saveStatus.message}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-6">Profile Information</h3>
              
              <div className="flex items-center gap-6 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-lg">
                    {localProfile.firstName.charAt(0) || 'U'}{localProfile.lastName.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={localProfile.firstName}
                    onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={localProfile.lastName}
                    onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={localProfile.email}
                  onChange={(e) => handleProfileUpdate('email', e.target.value)}
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={localProfile.phone}
                  onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself and your mental health journey..."
                  value={localProfile.bio}
                  onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button className="mt-6" onClick={handleSaveProfile} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-6">Notification Preferences</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Check-in Reminders</h4>
                    <p className="text-sm text-muted-foreground">Get reminded to complete your daily mood check-ins</p>
                  </div>
                  <Switch
                    checked={localPreferences.notifications.checkInReminders}
                    onCheckedChange={() => handleNotificationToggle('checkInReminders')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Chat Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications when the AI assistant responds</p>
                  </div>
                  <Switch
                    checked={localPreferences.notifications.chatNotifications}
                    onCheckedChange={() => handleNotificationToggle('chatNotifications')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Appointment Reminders</h4>
                    <p className="text-sm text-muted-foreground">Get reminded about upcoming therapy appointments</p>
                  </div>
                  <Switch
                    checked={localPreferences.notifications.appointmentReminders}
                    onCheckedChange={() => handleNotificationToggle('appointmentReminders')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-muted-foreground">Receive weekly summaries of your mental health progress</p>
                  </div>
                  <Switch
                    checked={localPreferences.notifications.weeklyReports}
                    onCheckedChange={() => handleNotificationToggle('weeklyReports')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Emergency Alerts</h4>
                    <p className="text-sm text-muted-foreground">Important safety notifications and crisis resources</p>
                  </div>
                  <Switch
                    checked={localPreferences.notifications.emergencyAlerts}
                    onCheckedChange={() => handleNotificationToggle('emergencyAlerts')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing Emails</h4>
                    <p className="text-sm text-muted-foreground">Receive updates about new features and resources</p>
                  </div>
                  <Switch
                    checked={localPreferences.notifications.marketingEmails}
                    onCheckedChange={() => handleNotificationToggle('marketingEmails')}
                  />
                </div>
              </div>

              <Button className="mt-6" onClick={handleSavePreferences} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Notification Preferences
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-6">Privacy & Data</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Sharing</h4>
                    <p className="text-sm text-muted-foreground">Allow sharing anonymized data with healthcare partners</p>
                  </div>
                  <Switch
                    checked={localPreferences.privacy.dataSharing}
                    onCheckedChange={() => handlePrivacyToggle('dataSharing')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Anonymous Research</h4>
                    <p className="text-sm text-muted-foreground">Contribute to mental health research (data anonymized)</p>
                  </div>
                  <Switch
                    checked={localPreferences.privacy.anonymousResearch}
                    onCheckedChange={() => handlePrivacyToggle('anonymousResearch')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Activity Tracking</h4>
                    <p className="text-sm text-muted-foreground">Track your usage patterns to improve recommendations</p>
                  </div>
                  <Switch
                    checked={localPreferences.privacy.activityTracking}
                    onCheckedChange={() => handlePrivacyToggle('activityTracking')}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Profile Visibility</h4>
                  <Select
                    value={localPreferences.privacy.profileVisibility}
                    onValueChange={(value) => setLocalPreferences(prev => ({ 
                      ...prev, 
                      privacy: { ...prev.privacy, profileVisibility: value as 'private' | 'healthcare' | 'support' }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="healthcare">Healthcare Providers Only</SelectItem>
                      <SelectItem value="support">Support Groups Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Alert className="mt-6">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your mental health data is always encrypted and stored securely. 
                  We never share identifiable information without your explicit consent.
                </AlertDescription>
              </Alert>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-6">App Preferences</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <Select
                    value={localPreferences.theme}
                    onValueChange={(value) => handlePreferenceChange('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Language</Label>
                  <Select
                    value={localPreferences.language}
                    onValueChange={(value) => handlePreferenceChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Timezone</Label>
                  <Select
                    value={localPreferences.timezone}
                    onValueChange={(value) => handlePreferenceChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Daily Reminder Time</Label>
                  <Input
                    type="time"
                    value={localPreferences.reminderTime}
                    onChange={(e) => handlePreferenceChange('reminderTime', e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Weekly Report Day</Label>
                  <Select
                    value={localPreferences.weeklyReportDay}
                    onValueChange={(value) => handlePreferenceChange('weeklyReportDay', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="mt-6" onClick={handleSavePreferences} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Preferences
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-6">Account Management</h3>
              
              <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Export Your Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download all your mental health data, including assessments, chat history, and progress reports.
                  </p>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </div>

                <Separator />

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Change Password</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your password to keep your account secure.
                  </p>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>

                <Separator />

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add an extra layer of security to your account.
                  </p>
                  <Button variant="outline">
                    <Shield className="mr-2 h-4 w-4" />
                    Enable 2FA
                  </Button>
                </div>

                <Separator />

                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-medium mb-2 text-red-800">Delete Account</h4>
                  <p className="text-sm text-red-700 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-medium mb-4">Support & Help</h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help Center
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}