import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NavigationProvider } from './contexts/NavigationContext';

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

export default function App() {
  return (
    <Router>
      <NavigationProvider>
        <div className="min-h-screen bg-background">
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </NavigationProvider>
    </Router>
  );
}