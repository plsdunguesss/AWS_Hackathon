import { useState } from "react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { AssessmentForm, AssessmentResults } from "./components/AssessmentForm";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { ProfessionalDirectory } from "./components/ProfessionalDirectory";
import { ResourcesPage } from "./components/ResourcesPage";
import { FindHelpPage } from "./components/FindHelpPage";
import { SignInPage } from "./components/SignInPage";
import { GetStartedPage } from "./components/GetStartedPage";
import { LearnMorePage } from "./components/LearnMorePage";
import { ChatPage } from "./components/ChatPage";
import { DashboardPage } from "./components/DashboardPage";
import { SettingsPage } from "./components/SettingsPage";
import { ProgressPage } from "./components/ProgressPage";

type AppState = 'home' | 'assessment' | 'results' | 'professionals' | 'resources' | 'findhelp' | 'signin' | 'getstarted' | 'learnmore' | 'chat' | 'dashboard' | 'settings' | 'progress';

export default function App() {
  const [currentView, setCurrentView] = useState<AppState>('home');
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);

  const handleStartAssessment = () => {
    setCurrentView('assessment');
  };

  const handleAssessmentComplete = (results: AssessmentResults) => {
    setAssessmentResults(results);
    setCurrentView('results');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setAssessmentResults(null);
  };

  const handleBackToAssessment = () => {
    setCurrentView('assessment');
  };

  const handleViewProfessionals = () => {
    setCurrentView('professionals');
  };

  const handleBackToResults = () => {
    setCurrentView('results');
  };

  const handleViewResources = () => {
    setCurrentView('resources');
  };

  const handleViewFindHelp = () => {
    setCurrentView('findhelp');
  };

  const handleViewSignIn = () => {
    setCurrentView('signin');
  };

  const handleViewGetStarted = () => {
    setCurrentView('getstarted');
  };

  const handleViewLearnMore = () => {
    setCurrentView('learnmore');
  };

  const handleViewChat = () => {
    setCurrentView('chat');
  };

  const handleViewDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleViewSettings = () => {
    setCurrentView('settings');
  };

  const handleViewProgress = () => {
    setCurrentView('progress');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Only show header on home view */}
      {currentView === 'home' && (
        <Header 
          onNavigate={(view) => {
            if (view === 'home') handleBackToHome();
            else if (view === 'assessment') handleStartAssessment();
            else if (view === 'resources') handleViewResources();
            else if (view === 'findhelp') handleViewFindHelp();
            else if (view === 'signin') handleViewSignIn();
            else if (view === 'getstarted') handleViewGetStarted();
            else if (view === 'dashboard') handleViewDashboard();
            else if (view === 'chat') handleViewChat();
          }}
        />
      )}
      
      {currentView === 'home' && (
        <HeroSection 
          onStartAssessment={handleStartAssessment}
          onLearnMore={handleViewLearnMore}
          onViewDashboard={handleViewDashboard}
        />
      )}
      
      {currentView === 'assessment' && (
        <AssessmentForm 
          onComplete={handleAssessmentComplete}
          onBack={handleBackToHome}
        />
      )}
      
      {currentView === 'results' && assessmentResults && (
        <ResultsDisplay 
          results={assessmentResults}
          onBack={handleBackToAssessment}
          onViewProfessionals={handleViewProfessionals}
        />
      )}
      
      {currentView === 'professionals' && (
        <ProfessionalDirectory onBack={handleBackToResults} />
      )}

      {currentView === 'resources' && (
        <ResourcesPage onBack={handleBackToHome} />
      )}

      {currentView === 'findhelp' && (
        <FindHelpPage 
          onBack={handleBackToHome}
          onViewProfessionals={handleViewProfessionals}
        />
      )}

      {currentView === 'signin' && (
        <SignInPage 
          onBack={handleBackToHome}
          onGetStarted={handleViewGetStarted}
        />
      )}

      {currentView === 'getstarted' && (
        <GetStartedPage 
          onBack={handleBackToHome}
          onStartAssessment={handleStartAssessment}
          onComplete={handleViewDashboard}
        />
      )}

      {currentView === 'learnmore' && (
        <LearnMorePage 
          onBack={handleBackToHome}
          onGetStarted={handleViewGetStarted}
          onStartAssessment={handleStartAssessment}
        />
      )}

      {currentView === 'chat' && (
        <ChatPage onBack={handleBackToHome} />
      )}

      {currentView === 'dashboard' && (
        <DashboardPage 
          onBack={handleBackToHome}
          onStartChat={handleViewChat}
          onViewResources={handleViewResources}
          onStartAssessment={handleStartAssessment}
          onViewProfessionals={handleViewProfessionals}
          onViewProgress={handleViewProgress}
          onViewSettings={handleViewSettings}
        />
      )}

      {currentView === 'settings' && (
        <SettingsPage onBack={() => setCurrentView('dashboard')} />
      )}

      {currentView === 'progress' && (
        <ProgressPage onBack={() => setCurrentView('dashboard')} />
      )}
    </div>
  );
}