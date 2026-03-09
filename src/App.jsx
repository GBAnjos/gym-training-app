import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useOnboarding } from './hooks/useOnboarding';
import { LoginScreen } from './components/LoginScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SchedulePage } from './pages/SchedulePage';
import { MealsPage } from './pages/MealsPage';
import { TrainingPage } from './pages/TrainingPage';
import { ProgressPage } from './pages/ProgressPage';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const { isOnboardingComplete, isCheckingOnboarding, refreshOnboardingStatus } = useOnboarding();
  const [activeTab, setActiveTab] = useState('schedule');

  // Show loading screen while checking auth or onboarding status
  if (loading || isCheckingOnboarding) {
    return <LoadingScreen />;
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  // Show onboarding for new users (isOnboardingComplete is false, not null)
  if (isOnboardingComplete === false) {
    return (
      <OnboardingFlow
        onComplete={() => {
          // Refresh the onboarding status to trigger re-render
          refreshOnboardingStatus();
        }}
      />
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'schedule':
        return <SchedulePage />;
      case 'meals':
        return <MealsPage />;
      case 'training':
        return <TrainingPage />;
      case 'progress':
        return <ProgressPage />;
      default:
        return <SchedulePage />;
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {renderPage()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
