import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NavigationProvider } from './contexts/NavigationContext';
import { ErrorBoundary } from './components/ui/error-boundary';
import { ToastProvider } from './components/ui/toast';
import { OfflineBanner } from './components/ui/error-alert';
import { AppNavigation } from './components/ui/app-navigation';
import { useNetworkStatus } from './hooks/useOffline';

// Import pages
import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProgressPage } from './pages/ProgressPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ResultsPage } from './pages/ResultsPage';
import { ProfessionalsPage } from './pages/ProfessionalsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { FindHelpPage } from './pages/FindHelpPage';
import { SignInPage } from './pages/SignInPage';
import { GetStartedPage } from './pages/GetStartedPage';
import { LearnMorePage } from './pages/LearnMorePage';
import { SystemStatusPage } from './pages/SystemStatusPage';

function AppContent() {
  const { isOnline } = useNetworkStatus();

  const handleRetryConnection = () => {
    // Force a page reload to retry connection
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      {!isOnline && <OfflineBanner onRetry={handleRetryConnection} />}
      
      <AppNavigation />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/professionals" element={<ProfessionalsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/find-help" element={<FindHelpPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/get-started" element={<GetStartedPage />} />
        <Route path="/learn-more" element={<LearnMorePage />} />
        <Route path="/system-status" element={<SystemStatusPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}