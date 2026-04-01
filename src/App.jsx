import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LanguageProvider } from './hooks/useLanguage.jsx';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './components/Toast';
import { useOnboarding } from './hooks/useOnboarding';
import { LoginScreen } from './components/LoginScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SchedulePage } from './pages/SchedulePage';
import { MealsPage } from './pages/MealsPage';
import { TrainingPage } from './pages/TrainingPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { ExerciseLibraryPage } from './pages/ExerciseLibraryPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { SmartPlanPage } from './pages/SmartPlanPage';
import { WorkoutBuilderPage } from './pages/WorkoutBuilderPage';
import { DietBuilderPage } from './pages/DietBuilderPage';
import { ImportPage } from './pages/ImportPage';
import './App.css';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { isOnboardingComplete, isCheckingOnboarding, refreshOnboardingStatus } = useOnboarding();
  const [activeTab, setActiveTab] = useState('schedule');

  // 1. First: Wait for auth check to complete
  if (authLoading) {
    return <LoadingScreen />;
  }

  // 2. Second: Must be logged in before anything else
  if (!user) {
    return <LoginScreen />;
  }

  // 3. Third: User is logged in, now check onboarding status
  if (isCheckingOnboarding) {
    return <LoadingScreen />;
  }

  // 4. Fourth: Show onboarding if not complete
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
        return <SchedulePage onTabChange={setActiveTab} />;
      case 'meals':
        return <MealsPage onTabChange={setActiveTab} />;
      case 'training':
        return <TrainingPage onTabChange={setActiveTab} />;
      case 'programs':
        return <ProgramsPage onBack={() => setActiveTab('training')} onComplete={() => setActiveTab('training')} onTabChange={setActiveTab} />;
      case 'smart-plan':
        return <SmartPlanPage onBack={() => setActiveTab('training')} onComplete={() => setActiveTab('training')} />;
      case 'build-plan':
        return <WorkoutBuilderPage onBack={() => setActiveTab('training')} onComplete={() => setActiveTab('training')} />;
      case 'diet-builder':
        return <DietBuilderPage onBack={() => setActiveTab('meals')} onComplete={() => setActiveTab('meals')} />;
      case 'import-training':
        return <ImportPage type="training" onBack={() => setActiveTab('programs')} onComplete={() => setActiveTab('training')} />;
      case 'import-diet':
        return <ImportPage type="diet" onBack={() => setActiveTab('meals')} onComplete={() => setActiveTab('meals')} />;
      case 'dashboard':
        return <DashboardPage onTabChange={setActiveTab} />;
      case 'library':
        return <ExerciseLibraryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <SchedulePage onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="app">
      <Header onAvatarClick={() => setActiveTab('settings')} />
      <main className="main-content">
        {renderPage()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
